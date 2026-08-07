import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Admin heavy reporting
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Analytics can be slower, target <1s
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/analytics/sales?period=today';

  const params = {
    headers: {
      Authorization: 'Bearer admin-test-token',
    },
  };

  const res = http.get(url, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(2);
}
