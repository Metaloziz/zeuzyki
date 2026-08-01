/**
 * Build-time prerender for SEO: serve dist, visit key routes with Playwright,
 * write static HTML shells Google can index without waiting on CSR.
 */
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");
const PORT = 4179;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  { path: "/", out: "index.html", titleIncludes: "Байдарки Минск" },
  { path: "/about", out: "about/index.html", titleIncludes: "Про нас" },
  {
    path: "/corporate",
    out: "corporate/index.html",
    titleIncludes: "Корпоративные",
  },
  { path: "/faq", out: "faq/index.html", titleIncludes: "Вопросы" },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

async function fileFromUrl(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const relative =
    clean === "/" || clean === ""
      ? "index.html"
      : clean.replace(/^\//, "").replace(/\/$/, "") +
        (extname(clean) ? "" : "/index.html");

  // Prefer exact file, then SPA fallback to root index.html
  const candidates = [
    join(distDir, relative),
    join(distDir, clean.replace(/^\//, "")),
    join(distDir, "index.html"),
  ];

  for (const filePath of candidates) {
    try {
      const data = await readFile(filePath);
      return { data, filePath };
    } catch {
      // try next
    }
  }
  return null;
}

function startStaticServer() {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", ORIGIN);
        const found = await fileFromUrl(url.pathname);
        if (!found) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const type = MIME[extname(found.filePath).toLowerCase()] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": type });
        res.end(found.data);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.listen(PORT, "127.0.0.1", () => resolveServer(server));
  });
}

async function prerenderRoute(page, route) {
  await page.goto(`${ORIGIN}${route.path}`, {
    waitUntil: "load",
    timeout: 60_000,
  });

  await page.waitForFunction(
    (needle) =>
      Boolean(document.getElementById("root")?.hasChildNodes()) &&
      document.title.includes(needle),
    route.titleIncludes,
    { timeout: 60_000 },
  );

  // Give layout effects a tick to flush meta tags.
  await new Promise((r) => setTimeout(r, 400));

  const html = await page.content();
  const outPath = join(distDir, route.out);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, "utf8");
  console.log(`[prerender] ${route.path} → ${route.out}`);
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const route of ROUTES) {
      await prerenderRoute(page, route);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log("[prerender] done");
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
