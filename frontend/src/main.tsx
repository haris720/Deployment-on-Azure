import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted variable fonts: no CDN request, no flash of unstyled text.
import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
