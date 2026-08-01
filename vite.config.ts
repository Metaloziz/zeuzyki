import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Local dev uses root; custom domain deploy sets VITE_BASE=/.
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
