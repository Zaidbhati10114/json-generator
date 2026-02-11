import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    local_test: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "20s", target: 5 }, // 5 users
        { duration: "20s", target: 10 }, // 10 users
        { duration: "20s", target: 20 }, // 20 users
        { duration: "20s", target: 30 }, // 30 users
        { duration: "20s", target: 40 }, // 40 users
        { duration: "20s", target: 0 },
      ],
    },
  },
};

const prompts = [
  "Generate 10 users",
  "Generate ecommerce products",
  "Generate blog posts",
  "Generate student database",
];

export default function () {
  const url = "http://localhost:3000/api/generate";

  const payload = JSON.stringify({
    prompt: prompts[Math.floor(Math.random() * prompts.length)],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-load-test-secret": "zaid-super-secret-load-test",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response < 3s": (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
