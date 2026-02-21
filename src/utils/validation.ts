import { RATE_LIMIT_CONFIG, ERROR_MESSAGES, API_CONFIG } from './config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Validate prompt input
 */
export function validatePrompt(prompt: unknown): ValidationResult {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.PROMPT_REQUIRED,
      statusCode: 400,
    };
  }

  if (prompt.length > RATE_LIMIT_CONFIG.MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.PROMPT_TOO_LONG,
      statusCode: 400,
    };
  }

  return { isValid: true };
}

/**
 * Calculate request cost based on prompt complexity
 */
export function calculateRequestCost(prompt: string): number {
  const countMatch = prompt.match(/\b(\d+)\b/);
  const itemCount = countMatch ? parseInt(countMatch[1]) : RATE_LIMIT_CONFIG.DEFAULT_ITEM_COUNT;

  const { COST_THRESHOLDS } = RATE_LIMIT_CONFIG;

  if (itemCount <= COST_THRESHOLDS.SMALL) return 1;
  if (itemCount <= COST_THRESHOLDS.MEDIUM) return 2;
  if (itemCount <= COST_THRESHOLDS.LARGE) return 3;
  return COST_THRESHOLDS.EXTRA_LARGE;
}

/**
 * Extract client IP for rate limiting
 */
export function getClientIp(request: Request): string {
  for (const header of API_CONFIG.IP_HEADERS) {
    const value = request.headers.get(header);
    if (value) {
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }

  return API_CONFIG.DEFAULT_IP;
}
