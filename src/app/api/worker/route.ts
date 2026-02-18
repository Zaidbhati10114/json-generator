import { NextRequest, NextResponse } from "next/server";
import { getPendingJobs, markJobCompleted, markJobFailed, markJobProcessing } from "@/lib/mongodb/jobs";
import { generateStructuredData } from "@/lib/ai/aiProvider";

/**
 * 🔐 Protect worker endpoint
 * Only authorized requests should call this endpoint
 */
function isAuthorized(request: NextRequest): boolean {
    const headerSecret = request.headers.get("x-worker-secret");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const secret = process.env.LOAD_TEST_SECRET;

    // Ensure secret is configured
    if (!secret) {
        console.error("⚠️  LOAD_TEST_SECRET environment variable is not set!");
        return false;
    }

    // Explicitly check each condition
    if (headerSecret && headerSecret === secret) {
        return true;
    }

    if (querySecret && querySecret === secret) {
        return true;
    }

    console.warn("🚫 Unauthorized access attempt detected");
    return false;
}

export async function GET(request: NextRequest) {
    try {
        // 🔐 Check authorization first
        if (!isAuthorized(request)) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Invalid or missing secret" },
                { status: 401 }
            );
        }

        console.log("👷 Worker started...");

        const jobs = await getPendingJobs(20);

        if (!jobs.length) {
            return NextResponse.json({
                message: "No pending jobs",
            });
        }

        console.log(`📦 Found ${jobs.length} pending jobs`);

        const results = {
            successful: 0,
            failed: 0,
            details: [] as any[]
        };

        for (const job of jobs) {
            const jobId = job._id.toString();

            try {
                console.log(`⚙️  Processing job: ${jobId}`);
                console.log(`📝 Prompt: "${job.prompt}"`);

                await markJobProcessing(jobId);

                // Generate - count is auto-detected from prompt
                const { text: parsedData, modelUsed, metadata } = await generateStructuredData(job.prompt);

                await markJobCompleted(jobId, parsedData, modelUsed);

                console.log(`✅ Job completed: ${jobId} (${metadata?.actualCount || 'unknown'} items generated)`);
                results.successful++;
                results.details.push({
                    jobId,
                    status: "success",
                    modelUsed,
                    itemsGenerated: metadata?.actualCount
                });

            } catch (err: any) {
                console.error(`❌ Job failed: ${jobId}`, err.message);
                await markJobFailed(jobId, err.message);
                results.failed++;
                results.details.push({
                    jobId,
                    status: "failed",
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            processedJobs: jobs.length,
            ...results
        });

    } catch (error: any) {
        console.error("💥 Worker error:", error);
        return NextResponse.json(
            { error: "Worker failed", message: error.message },
            { status: 500 }
        );
    }
}