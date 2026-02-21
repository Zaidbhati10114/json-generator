import { generateWithFallback } from "@/lib/gemini/modelFallback";
import { enhancePrompt } from "@/lib/gemini/promptEnhancer";
import { validatePrompt } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/utils/config";

export interface GenerationRequest {
  prompt: string;
}

export interface GenerationResult {
  success: boolean;
  generatedData?: any;
  rawText?: string;
  modelUsed?: string;
  promptEnhanced?: boolean;
  enhancementMethod?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Generate AI data with prompt enhancement and fallback
 */
export async function generateAIData(request: GenerationRequest): Promise<GenerationResult> {
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
    console.log("📝 Original prompt:", prompt);

    // Prompt enhancement
    const { enhanced, wasEnhanced, method } = await enhancePrompt(prompt);

    if (wasEnhanced) {
      console.log(`🔧 Enhanced using ${method}:`, enhanced);
    }

    // AI generation (Gemini fallback system)
    const { text, modelUsed } = await generateWithFallback(enhanced);

    console.log("✅ Generation complete");

    // Clean & parse AI response
    const cleanedText = text.replace(/```json|```/gi, "").trim();
    let parsedData;

    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      parsedData = { raw_output: cleanedText };
    }

    return {
      success: true,
      generatedData: parsedData,
      rawText: cleanedText,
      modelUsed,
      promptEnhanced: wasEnhanced,
      enhancementMethod: method,
    };

  } catch (error) {
    console.error("❌ Error generating text:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
      statusCode: 500,
    };
  }
}

/**
 * Format generation response with rate limit metadata
 */
export function formatGenerationResponse(
  result: GenerationResult,
  rateLimitMetadata: {
    remainingTokens: number;
    resetTime: string;
    country?: string;
    loadTestMode?: boolean;
  }
) {
  if (!result.success) {
    return {
      error: result.error,
    };
  }

  return {
    generatedData: result.generatedData,
    rawText: result.rawText,
    modelUsed: result.modelUsed,
    promptEnhanced: result.promptEnhanced,
    enhancementMethod: result.enhancementMethod,
    ...rateLimitMetadata,
  };
}
