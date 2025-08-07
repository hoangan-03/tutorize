/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function fixLineEndings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, dist, and other build directories
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile()) {
      // Only process text files
      const ext = path.extname(file).toLowerCase();
      const textExtensions = [
        '.ts',
        '.js',
        '.tsx',
        '.jsx',
        '.json',
        '.md',
        '.yml',
        '.yaml',
        '.txt',
        '.sql',
        '.prisma',
        '.env',
        '.gitignore',
        '.dockerignore',
        '.html',
        '.css',
        '.scss',
        '.less',
      ];

      if (textExtensions.includes(ext) || file.startsWith('.')) {
        callback(filePath);
      }
    }
  });
}

console.log('🔧 Fixing line endings in all text files...');

let fixedCount = 0;
const startTime = Date.now();

walkDir(process.cwd(), (filePath) => {
  if (fixLineEndings(filePath)) {
    fixedCount++;
  }
});

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log(`\n✅ Completed! Fixed ${fixedCount} files in ${duration}s`);

if (fixedCount > 0) {
  console.log('\n📝 Run the following commands to apply formatting:');
  console.log('npm run format');
  console.log('npm run lint -- --fix');
}
