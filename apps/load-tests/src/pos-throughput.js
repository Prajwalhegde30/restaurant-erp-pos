import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp-up to 50 users
    { duration: '1m', target: 50 }, // Stay at 50 users for 1 min
    { duration: '30s', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<100'], // 99% of requests must complete below 100ms
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/orders';
  const payload = JSON.stringify({
    branchId: 'branch-1',
    items: [{ menuItemId: 'item-1', quantity: 2 }],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 201': (r) => r.status === 201,
    'latency < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
