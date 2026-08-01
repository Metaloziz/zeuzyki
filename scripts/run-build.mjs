/**
 * Cross-platform build entrypoints:
 *   pages → GitHub Pages test stand (/zeuzyki/)
 *   prod  → real host root (zeuzyki.by)
 */
import { spawnSync } from "node:child_process";

const mode = process.argv[2] === "pages" ? "pages" : "prod";

const env = {
  ...process.env,
  VITE_SITE_URL: "https://zeuzyki.by",
  VITE_BASE: mode === "pages" ? "/zeuzyki/" : "/",
};

console.log(`[build] mode=${mode} VITE_BASE=${env.VITE_BASE}`);

const result = spawnSync("yarn", ["build"], {
  env,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
