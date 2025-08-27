const fs = require("fs");
const path = require("path");
const https = require("https");

const resultsPath = process.argv[2] || "tests/k6/results.json";
const pushUrl = process.env.GRAFANA_PUSH_URL;
const username = process.env.GRAFANA_USERNAME;
const password = process.env.GRAFANA_PASSWORD;

if (!fs.existsSync(resultsPath)) {
  console.error("k6 results file not found:", resultsPath);
  process.exit(2);
}

if (!pushUrl) {
  console.log("GRAFANA_PUSH_URL not set; skipping publish.");
  process.exit(0);
}

if (!username || !password) {
  console.log("Authentication not configured. Set GRAFANA_USERNAME and GRAFANA_PASSWORD (Basic auth)");
  process.exit(0);
}
const payload = fs.readFileSync(resultsPath, "utf-8");

const url = new URL(pushUrl);

console.log("Publishing to Grafana host:", url.hostname);
console.log("Publishing to path:", url.pathname + url.search);

const credentials = Buffer.from(`${username}:${password}`).toString("base64");
const authHeader = `Basic ${credentials}`;
console.log("Using Basic authentication");

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname + url.search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    Authorization: authHeader,
  },
};

const req = https.request(options, (res) => {
  console.log("Grafana response status:", res.statusCode);
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Response body:", data);
    process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
  });
});

req.on("error", (e) => {
  console.error("Error publishing to Grafana:", e);
  process.exit(1);
});

req.write(payload);
req.end();
