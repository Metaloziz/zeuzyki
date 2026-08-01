/**
 * Build-time prerender for SEO: serve dist, visit key routes with Playwright,
 * write static HTML shells Google can index without waiting on CSR.
 *
 * Respects VITE_BASE (e.g. /zeuzyki/ on GitHub Pages, / on production host).
 * Strips localhost absolute URLs that Playwright serializes into the DOM.
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

/** "" | "/zeuzyki" — no trailing slash */
const BASE = (process.env.VITE_BASE ?? "/").replace(/\/$/, "");

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

function stripBase(urlPath) {
  if (!BASE) return urlPath || "/";
  if (urlPath === BASE || urlPath === `${BASE}/`) return "/";
  if (urlPath.startsWith(`${BASE}/`)) return urlPath.slice(BASE.length);
  return urlPath;
}

async function fileFromUrl(urlPath) {
  const clean = stripBase(
    decodeURIComponent(urlPath.split("?")[0].split("#")[0]),
  );
  const relative =
    clean === "/" || clean === ""
      ? "index.html"
      : clean.replace(/^\//, "").replace(/\/$/, "") +
        (extname(clean) ? "" : "/index.html");

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
        const type =
          MIME[extname(found.filePath).toLowerCase()] ||
          "application/octet-stream";
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

/** Playwright serializes some attrs as absolute localhost URLs — undo that. */
function sanitizeHtml(html) {
  return html
    .replaceAll(`${ORIGIN}`, "")
    .replaceAll(`http://localhost:${PORT}`, "")
    .replaceAll(`http://127.0.0.1:${PORT}`, "");
}

async function prerenderRoute(page, route) {
  const urlPath =
    route.path === "/"
      ? `${BASE}/` || "/"
      : `${BASE}${route.path}`;

  await page.goto(`${ORIGIN}${urlPath}`, {
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

  await new Promise((r) => setTimeout(r, 400));

  const html = sanitizeHtml(await page.content());
  const outPath = join(distDir, route.out);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, "utf8");
  console.log(`[prerender] ${urlPath} → ${route.out}`);
}

async function main() {
  console.log(`[prerender] VITE_BASE=${BASE || "/"}`);
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
