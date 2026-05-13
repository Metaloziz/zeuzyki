import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "./theme";
import { App } from "./App";
import "./global.css";

// Vite injects the base path here at build time. Drop trailing slash for router.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
