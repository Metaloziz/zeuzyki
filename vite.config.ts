import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// On GitHub Pages the app lives under /<repo-name>/.
// Local dev uses root; workflow sets VITE_BASE=/zeuzyki/ for deploy.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
