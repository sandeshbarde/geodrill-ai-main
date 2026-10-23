/**
 * setup-wasm.js
 * Copies @next/swc-wasm-nodejs into node_modules/next/wasm so that
 * Next.js can find it as a WASM fallback when the native SWC binary
 * is blocked by Application Control policies (common in enterprise Windows).
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', '@next', 'swc-wasm-nodejs');
const dst = path.join(__dirname, '..', 'node_modules', 'next', 'wasm', '@next', 'swc-wasm-nodejs');

if (!fs.existsSync(src)) {
  console.warn('[setup-wasm] @next/swc-wasm-nodejs not found in node_modules — skipping.');
  process.exit(0);
}

fs.mkdirSync(dst, { recursive: true });

const files = fs.readdirSync(src);
for (const file of files) {
  const srcFile = path.join(src, file);
  const dstFile = path.join(dst, file);
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, dstFile);
  }
}

console.log('[setup-wasm] ✓ Copied WASM bindings to next/wasm/');
