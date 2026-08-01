import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Local/prod host uses VITE_BASE=/ ; GitHub Pages test stand uses /zeuzyki/.
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
