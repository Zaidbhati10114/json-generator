import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt } from "@/lib/gemini/promptEnhancer";
import { generateWithFallback } from "@/lib/gemini/modelFallback";
import { getPendingJobs, markJobCompleted, markJobFailed, markJobProcessing } from "@/lib/mongodb/jobs";


/**
 * 🔐 Protect worker endpoint
 * Only UptimeRobot / you should call this
 */
function isAuthorized(request: NextRequest) {
    const headerSecret = request.headers.get("x-worker-secret");
    const querySecret = request.nextUrl.searchParams.get("secret");

    const secret = process.env.LOAD_TEST_SECRET;

    return (
        (headerSecret && headerSecret === secret) ||
        (querySecret && querySecret === secret)
    );
}


export async function GET(request: NextRequest) {
    try {
        if (!isAuthorized(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("👷 Worker started...");

        /**
         * ⏳ Fetch pending jobs from queue
         * We process small batches to avoid timeouts
         */
        const jobs = await getPendingJobs(3); // process 3 per run

        if (!jobs.length) {
            return NextResponse.json({
                message: "No pending jobs",
            });
        }

        console.log(`Found ${jobs.length} pending jobs`);

        /**
         * 🔁 Process each job
         */
        for (const job of jobs) {
            const jobId = job._id.toString();

            try {
                console.log("Processing job:", jobId);

                await markJobProcessing(jobId);

                /**
                 * ✨ Enhance prompt
                 */
                const { enhanced } = await enhancePrompt(job.prompt);

                /**
                 * 🤖 Generate JSON via Gemini
                 */
                const { text, modelUsed } = await generateWithFallback(enhanced);

                /**
                 * 🧹 Clean response
                 */
                const cleanedText = text.replace(/```json|```/gi, "").trim();

                let parsedData;
                try {
                    parsedData = JSON.parse(cleanedText);
                } catch {
                    parsedData = { raw_output: cleanedText };
                }

                /**
                 * ✅ Save result
                 */
                await markJobCompleted(jobId, parsedData, modelUsed);

                console.log("Job completed:", jobId);
            } catch (err: any) {
                console.error("Job failed:", jobId, err.message);
                await markJobFailed(jobId, err.message);
            }
        }

        return NextResponse.json({
            success: true,
            processedJobs: jobs.length,
        });
    } catch (error) {
        console.error("Worker error:", error);
        return NextResponse.json(
            { error: "Worker failed" },
            { status: 500 }
        );
    }
}
