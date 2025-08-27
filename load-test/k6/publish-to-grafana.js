#!/usr/bin/env node
// Small script to publish k6 JSON result to a Grafana Metrics endpoint (Pushgateway-like).
// Expects env: GRAFANA_PUSH_URL,GRAFANA_API_KEY, and path to the k6 JSON (default tests/k6/results.json)

const fs = require('fs');
const path = require('path');
const https = require('https');

const resultsPath = process.argv[2] || 'tests/k6/results.json';
const pushUrl = process.env.GRAFANA_PUSH_URL;
// Accept either the old name or a clearer name for access policy tokens
const apiKey = process.env.GRAFANA_API_KEY || process.env.GRAFANA_ACCESS_TOKEN;

if (!fs.existsSync(resultsPath)) {
    console.error('k6 results file not found:', resultsPath);
    process.exit(2);
}

if (!pushUrl || !apiKey) {
    console.log('GRAFANA_PUSH_URL or GRAFANA_API_KEY not set; skipping publish.');
    process.exit(0);
}

const payload = fs.readFileSync(resultsPath, 'utf-8');


const url = new URL(pushUrl);

console.log('Publishing to Grafana host:', url.hostname);
console.log('Publishing to path:', url.pathname + url.search);

const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${apiKey}`,
    },
};

const req = https.request(options, (res) => {
    console.log('Grafana response status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
        console.log('Response body:', data);
        process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
    });
});

req.on('error', (e) => {
    console.error('Error publishing to Grafana:', e);
    process.exit(1);
});

// Helpful hint when authentication fails
process.on('exit', (code) => {
    if (code === 1) {
        console.error('\nIf you see a 401 with "legacy auth" please check:');
        console.error('- Make sure GRAFANA_PUSH_URL points to your Grafana Cloud push/remote_write endpoint.');
        console.error('- Use an Access Policy token (not the deprecated API key). Create it in Grafana Cloud -> Stack -> Access Tokens.');
        console.error('- Set the token in the repo secret GRAFANA_API_KEY (or GRAFANA_ACCESS_TOKEN).');
        console.error('- Test locally with: curl -v -H "Authorization: Bearer <token>" -X POST --data-binary @load-test/k6/results.json "<PUSH_URL>"');
    }
});

req.write(payload);
req.end();
