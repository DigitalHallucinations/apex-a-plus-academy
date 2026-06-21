import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ["VITE_", "TAURI_"],
  // The Tauri build copies src/content (incl. test files) under src-tauri/target;
  // keep the test runner out of those generated copies.
  test: { exclude: [...configDefaults.exclude, "src-tauri/**"] },
  build: {
    target: ["es2021", "chrome100", "safari13"],
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") ||
              id.includes("node_modules/react-smooth") || id.includes("node_modules/decimal.js-light")) {
            return "charts";
          }
        }
      }
    }
  }
});
