import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { shopApiPlugin } from "./vite.shopApi";

export default defineConfig({
  plugins: [react(), shopApiPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
});
