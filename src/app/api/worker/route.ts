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

    // Check if either header or query param matches the secret
    const isValid = Boolean(
        (headerSecret && headerSecret === secret) ||
        (querySecret && querySecret === secret)
    );

    if (!isValid) {
        console.warn("🚫 Unauthorized access attempt detected");
    }

    return isValid;
}

/**
 * 🔨 Process a single job
 */
async function processJob(job: any) {
    const jobId = job._id.toString();

    try {
        console.log(`⚙️  Processing job: ${jobId}`);
        console.log(`📝 Prompt: "${job.prompt.substring(0, 80)}..."`);

        await markJobProcessing(jobId);

        // Generate - count is auto-detected from prompt
        const { text: parsedData, modelUsed, metadata } = await generateStructuredData(job.prompt);

        await markJobCompleted(jobId, parsedData, modelUsed);

        console.log(`✅ Job completed: ${jobId} (${metadata?.actualCount || 'unknown'} items generated)`);

        return {
            jobId,
            status: "success",
            modelUsed,
            itemsGenerated: metadata?.actualCount
        };

    } catch (err: any) {
        console.error(`❌ Job failed: ${jobId}`, err.message);
        await markJobFailed(jobId, err.message);

        return {
            jobId,
            status: "failed",
            error: err.message
        };
    }
}

/**
 * 🚀 Main worker endpoint with parallel processing
 */
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

        // ⭐ Process jobs in parallel batches
        const CONCURRENT_JOBS = 5; // Process 5 jobs simultaneously

        for (let i = 0; i < jobs.length; i += CONCURRENT_JOBS) {
            const batch = jobs.slice(i, i + CONCURRENT_JOBS);
            const batchNumber = Math.floor(i / CONCURRENT_JOBS) + 1;
            const totalBatches = Math.ceil(jobs.length / CONCURRENT_JOBS);

            console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}: ${batch.length} jobs in parallel`);

            // Process this batch in parallel using Promise.allSettled
            // (allSettled ensures all jobs complete even if some fail)
            const batchResults = await Promise.allSettled(
                batch.map(job => processJob(job))
            );

            // Collect results from this batch
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const jobResult = result.value;

                    if (jobResult.status === 'success') {
                        results.successful++;
                    } else {
                        results.failed++;
                    }

                    results.details.push(jobResult);
                } else {
                    // Promise was rejected (shouldn't happen with our error handling)
                    results.failed++;
                    results.details.push({
                        jobId: batch[index]._id.toString(),
                        status: 'failed',
                        error: result.reason?.message || 'Unknown error'
                    });
                }
            });

            console.log(`✅ Batch ${batchNumber}/${totalBatches} completed`);
        }

        console.log(`🎉 All jobs processed: ${results.successful} successful, ${results.failed} failed`);

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