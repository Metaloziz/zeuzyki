import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// On GitHub Pages the app lives under /<repo-name>/.
// Local dev uses root; workflow sets VITE_BASE=/zeuzyki/ for deploy.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
