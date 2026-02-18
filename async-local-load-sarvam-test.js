import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    create_jobs: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 200 },
        { duration: "30s", target: 0 },
      ],
    },
  },
};

export default function () {
  const url = "http://localhost:3000/api/create-job";

  const payload = JSON.stringify({
    prompt: "Generate users dataset",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-load-test-secret": "zaid-super-secret-load-test",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status 200": (r) => r.status === 200,
    "response under 300ms": (r) => r.timings.duration < 300,
  });

  sleep(0.5);
}
