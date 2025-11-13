import { defineConfig } from "vitest/config";
import path from "path";
import { readFileSync } from "fs";

const tsconfig = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
const compilerOptions = tsconfig.compilerOptions || {};
const pathsToAlias = {};
for (const [key, value] of Object.entries(compilerOptions.paths || {})) {
  const keyWithoutAsterisk = key.replace(/\/\*$/, "");
  pathsToAlias[keyWithoutAsterisk] = value.map((p: string) => p.replace(/\/\*$/, ""));
}

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"], // If you have a setup file
  },
  resolve: {
    alias: {
      ...pathsToAlias,
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
