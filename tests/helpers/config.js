// Test configuration constants
export const BASE_URL = "http://localhost:3000";
export const API_ENDPOINTS = {
  CREATE_JOB: "/api/create-job",
  JOB_STATUS: "/api/job-status",
  GENERATE: "/api/generate",
};

export const RATE_LIMIT_CONFIG = {
  EXPECTED_SUCCESS: 15,
  EXPECTED_RATE_LIMITED: 5,
  TEST_REQUESTS: 20,
  SEQUENTIAL_DELAY: 100,
};

export const LOAD_TEST_HEADERS = {
  "Content-Type": "application/json",
  "x-load-test-secret": process.env.LOAD_TEST_SECRET || "",
};
