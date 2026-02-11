import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    real_users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 20 },
        { duration: "1m", target: 40 },
        { duration: "1m", target: 60 },
        { duration: "1m", target: 80 },
        { duration: "30s", target: 0 },
      ],
    },
  },
};

const prompts = [
  "Generate 10 users dataset",
  "Generate 10 ecommerce products",
  "Generate 5 blog posts",
  "Generate  6 students database",
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
  });

  // 🧠 simulate human thinking time
  sleep(Math.random() * 20 + 10);
}
