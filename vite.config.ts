import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// On GitHub Pages the app lives under /<repo-name>/.
// Override with VITE_BASE='/' for custom-domain or local-root deploys.
const base = process.env.VITE_BASE ?? "/zeuzyki/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
