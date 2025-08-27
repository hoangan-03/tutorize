import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 10,
    duration: __ENV.K6_DURATION || '30s',
    cloud: {},
};

const BASE = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

export default function () {
    // Health
    let res = http.get(`${BASE}/health`);
    check(res, { 'health: status 200': (r) => r.status === 200 });

    // Exercises (may be protected in prod)
    res = http.get(`${BASE}/exercises?limit=5&page=1`);
    check(res, { 'exercises: ok or auth error': (r) => [200, 401, 403].includes(r.status) });

    // Quizzes
    res = http.get(`${BASE}/quizzes?limit=5&page=1`);
    check(res, { 'quizzes: ok or auth error': (r) => [200, 401].includes(r.status) });

    // PDF generation (heavy) - accept 200 or 404
    res = http.get(`${BASE}/pdf/exercise/1`);
    check(res, { 'pdf: ok or not found': (r) => [200, 404].includes(r.status) });

    sleep(1);
}
