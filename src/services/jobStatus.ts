import { getJobStatus } from "@/lib/mongodb/jobs";
import { createNotFoundResponse, createValidationErrorResponse } from "./responseFormatting";
import { ERROR_MESSAGES } from "@/utils/config";

export interface JobStatusRequest {
  jobId: string;
}

export interface JobStatusResult {
  success: boolean;
  job?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Validate job ID parameter
 */
function validateJobId(jobId: string | null): { valid: boolean; error?: string } {
  if (!jobId || jobId === 'undefined' || jobId === 'null') {
    return {
      valid: false,
      error: "Job ID is required and must be valid",
    };
  }

  if (typeof jobId !== 'string' || jobId.trim().length === 0) {
    return {
      valid: false,
      error: "Job ID must be a non-empty string",
    };
  }

  return { valid: true };
}

/**
 * Get job status with validation
 */
export async function getJobStatusService(request: JobStatusRequest): Promise<JobStatusResult> {
  const { jobId } = request;

  // Validate job ID
  const validation = validateJobId(jobId);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      statusCode: 400,
    };
  }

  try {
    const job = await getJobStatus(jobId);

    if (!job) {
      return {
        success: false,
        error: "Job not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      job,
    };

  } catch (error: any) {
    console.error("Job status error:", error);

    // Return better error messages
    if (error.message.includes('Invalid job ID')) {
      return {
        success: false,
        error: "Invalid job ID format",
        statusCode: 400,
      };
    }

    return {
      success: false,
      error: "Failed to get job status",
      statusCode: 500,
    };
  }
}

/**
 * Extract job ID from request URL parameters
 */
export function extractJobIdFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("id");
}
