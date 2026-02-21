// Configuration constants and environment management

export const RATE_LIMIT_CONFIG = {
  // Create job endpoint
  CREATE_JOB: {
    CAPACITY: 15,
    REFILL_RATE: 10,
    INTERVAL: 60, // seconds
    DEV_CAPACITY: 15,
    DEV_WINDOW_MS: 60000, // 1 minute
  },

  // Generate endpoint (more restrictive)
  GENERATE: {
    CAPACITY: 3,
    REFILL_RATE: 2,
    INTERVAL: 60, // seconds
    DEV_CAPACITY: 3,
    DEV_WINDOW_MS: 60000, // 1 minute
  },

  // Live endpoint (most restrictive)
  LIVE: {
    CAPACITY: 3,
    REFILL_RATE: 2,
    INTERVAL: 60, // seconds
    DAILY_LIMIT: 10,
    DEV_CAPACITY: 3,
    DEV_WINDOW_MS: 60000, // 1 minute
  },

  // Cost calculation thresholds
  COST_THRESHOLDS: {
    SMALL: 10,   // <= 10 items = 1 cost
    MEDIUM: 25,  // <= 25 items = 2 cost  
    LARGE: 50,   // <= 50 items = 3 cost
    EXTRA_LARGE: 5, // > 50 items = 5 cost
  },

  // Request limits
  MAX_PROMPT_LENGTH: 2000,
  DEFAULT_ITEM_COUNT: 5,
} as const;

export const API_CONFIG = {
  LOAD_TEST_HEADER: "x-load-test-secret",
  IP_HEADERS: [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
  ],
  DEFAULT_IP: '127.0.0.1',
} as const;

export const ERROR_MESSAGES = {
  PROMPT_REQUIRED: "Prompt is required",
  PROMPT_TOO_LONG: `Prompt too long (max ${RATE_LIMIT_CONFIG.MAX_PROMPT_LENGTH} chars)`,
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  RATE_LIMIT_MESSAGE: "You're making requests too quickly. Please wait a moment.",
  REQUEST_BLOCKED: "Request blocked",
  SECURITY_MESSAGE: "Your request was blocked by our security system.",
  FAILED_TO_CREATE_JOB: "Failed to create job",
} as const;

export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isLoadTestRequest = (request: Request): boolean => {
  const header = request.headers.get(API_CONFIG.LOAD_TEST_HEADER);
  const secret = process.env.LOAD_TEST_SECRET;
  return !!(header && secret && header === secret);
};
