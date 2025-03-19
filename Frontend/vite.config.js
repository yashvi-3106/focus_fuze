// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
  
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window", // Polyfill `global` as `window` for browser compatibility
    "process.env": {}, // Polyfill `process.env` for libraries expecting it
  },
  resolve: {
    alias: {
      // Ensure `randombytes` uses the browser-compatible version
      randombytes: "randombytes/browser",
      // Polyfill Node.js `buffer` with the browser-compatible `buffer` package
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});