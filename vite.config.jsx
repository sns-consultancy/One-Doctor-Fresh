import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// IMPORTANT: only load VITE_* vars; do NOT pass all env into define()
export default defineConfig(({ mode }) => {
  // This call returns ONLY keys that start with "VITE_"
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },

    // Only expose VITE_* to the client
    envPrefix: "VITE_",

    // Do NOT inject process.env wholesale.
    // If some lib needs NODE_ENV, expose just that SINGLE value.
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
      // nothing else here — do not spread env or process.env
    },
  };
});
