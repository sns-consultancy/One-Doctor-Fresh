// vite.config.jsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  envPrefix: "VITE_",          // ← only expose VITE_* to the client
  // Do NOT add: define: { "process.env": process.env }
});
