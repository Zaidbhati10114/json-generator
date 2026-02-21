import { createJob } from "@/lib/mongodb/jobs";
import { validatePrompt, calculateRequestCost } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/utils/config";

export interface JobCreationRequest {
  prompt: string;
}

export interface JobCreationResult {
  success: boolean;
  jobId?: string;
  error?: string;
  statusCode?: number;
  requestCost?: number;
}

/**
 * Create a new job with validation and cost calculation
 */
export async function createJobService(request: JobCreationRequest): Promise<JobCreationResult> {
  const { prompt } = request;

  // Validate input
  const validation = validatePrompt(prompt);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      statusCode: validation.statusCode,
    };
  }

  try {
    // Calculate request cost
    const requestCost = calculateRequestCost(prompt);
    console.log(`💰 Calculated request cost: ${requestCost}`);

    // Create job in MongoDB queue
    const jobId = await createJob(prompt);
    console.log(`✅ Job created with ID: ${jobId}`);

    return {
      success: true,
      jobId: jobId.toString(),
      requestCost,
    };

  } catch (error) {
    console.error("Create job error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.FAILED_TO_CREATE_JOB,
      statusCode: 500,
    };
  }
}

/**
 * Format successful job creation response
 */
export function formatJobCreationResponse(result: JobCreationResult) {
  if (!result.success) {
    return {
      error: result.error,
    };
  }

  return {
    success: true,
    jobId: result.jobId,
    id: result.jobId,
    message: "Job created successfully",
  };
}
