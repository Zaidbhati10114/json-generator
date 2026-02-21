import { getPendingJobs, markJobCompleted, markJobFailed, markJobProcessing } from "@/lib/mongodb/jobs";
import { generateStructuredData } from "@/lib/ai/aiProvider";

export interface JobProcessingResult {
  jobId: string;
  status: "success" | "failed";
  modelUsed?: string;
  itemsGenerated?: number;
  error?: string;
}

export interface BatchProcessingResult {
  successful: number;
  failed: number;
  details: JobProcessingResult[];
}

/**
 * Process a single job
 */
export async function processJob(job: any): Promise<JobProcessingResult> {
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
 * Process multiple jobs in parallel batches
 */
export async function processJobsInBatches(
  jobs: any[],
  concurrentJobs: number = 5
): Promise<BatchProcessingResult> {
  const results: BatchProcessingResult = {
    successful: 0,
    failed: 0,
    details: []
  };

  console.log(`📦 Found ${jobs.length} pending jobs`);

  // Process jobs in parallel batches
  for (let i = 0; i < jobs.length; i += concurrentJobs) {
    const batch = jobs.slice(i, i + concurrentJobs);
    const batchNumber = Math.floor(i / concurrentJobs) + 1;
    const totalBatches = Math.ceil(jobs.length / concurrentJobs);

    console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}: ${batch.length} jobs in parallel`);

    // Process this batch in parallel using Promise.allSettled
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

  return results;
}

/**
 * Get pending jobs for processing
 */
export async function getPendingJobsForProcessing(limit: number = 20) {
  return await getPendingJobs(limit);
}
