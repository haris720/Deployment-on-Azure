import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // Must match the backend's FRONTEND_URL (its CORS allowlist).
    // strictPort: if 5173 is taken, fail loudly rather than silently
    // moving to 5174, which the API would then reject as a bad origin.
    port: 5173,
    strictPort: true,
  },

  build: {
    // Vendor code changes rarely; splitting it lets browsers keep it
    // cached across deploys of our own app code.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router") || id.includes("/react")) return "react";
          if (id.includes("@tanstack") || id.includes("axios")) return "query";
        },
      },
    },
  },
});
