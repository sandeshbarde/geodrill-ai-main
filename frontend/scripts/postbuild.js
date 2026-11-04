/**
 * postbuild.js
 * After `next build` with output: 'standalone', copy the static assets
 * that Next.js does NOT bundle into .next/standalone automatically.
 *
 * Required layout for `node .next/standalone/server.js` to work:
 *   .next/standalone/
 *   .next/standalone/.next/static/   <-- copied from .next/static
 *   .next/standalone/public/          <-- copied from public/
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');   // frontend/

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy .next/static → .next/standalone/.next/static
copyDir(
  path.join(root, '.next', 'static'),
  path.join(root, '.next', 'standalone', '.next', 'static')
);
console.log('✅ Copied .next/static → .next/standalone/.next/static');

// 2. Copy public → .next/standalone/public
copyDir(
  path.join(root, 'public'),
  path.join(root, '.next', 'standalone', 'public')
);
console.log('✅ Copied public/ → .next/standalone/public');

console.log('🚀 Standalone build ready! Start with: node .next/standalone/server.js');
