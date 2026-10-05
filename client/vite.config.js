import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // In production, API calls go to same origin (Express serves both)
  // In development, proxy to local server
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:4000" },
  },
  build: {
    outDir: "dist",
  },
});
