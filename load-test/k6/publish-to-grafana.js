#!/usr/bin/env node
// Small script to publish k6 JSON result to a Grafana Metrics endpoint (Pushgateway-like).
// Expects env: GRAFANA_PUSH_URL,GRAFANA_API_KEY, and path to the k6 JSON (default tests/k6/results.json)

const fs = require('fs');
const path = require('path');
const https = require('https');

const resultsPath = process.argv[2] || 'tests/k6/results.json';
const pushUrl = process.env.GRAFANA_PUSH_URL;
const apiKey = process.env.GRAFANA_API_KEY;

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

req.write(payload);
req.end();
