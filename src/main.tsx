import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "./theme";
import { App } from "./App";
import "./brand.css";
import "./global.css";

// Vite injects the base path here at build time. Drop trailing slash for router.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

// Always client-mount. Prerendered HTML in dist is for crawlers/social scrapers;
// hydrating would fight GSAP/Mantine and risk mismatch warnings.
createRoot(rootEl).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
