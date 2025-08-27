
const { spawn } = require('child_process');

const k6Token = process.env.K6_CLOUD_TOKEN;
if (!k6Token) {
	console.error('K6_CLOUD_TOKEN environment variable is not set.');
	process.exit(1);
}

const scriptPath = process.argv[2] || 'load-test/k6/load-test.js';
console.log(`Running: k6 cloud ${scriptPath}`);

const k6 = spawn('k6', ['cloud', scriptPath], {
	stdio: 'inherit',
	env: { ...process.env, K6_CLOUD_TOKEN: k6Token },
});

k6.on('close', (code) => {
	process.exit(code);
});
