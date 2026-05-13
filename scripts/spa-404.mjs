// Copies dist/index.html -> dist/404.html so GitHub Pages serves the SPA
// shell for any unknown sub-path, letting react-router take over.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const src = resolve('dist', 'index.html');
const dst = resolve('dist', '404.html');

if (!existsSync(src)) {
  console.error('[spa-404] dist/index.html not found — run vite build first.');
  process.exit(1);
}

copyFileSync(src, dst);
console.log('[spa-404] dist/404.html written.');
