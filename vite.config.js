import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  return defineConfig({
    define: {
      "process.env": {},
    },
    run: {
      entry: path.resolve(__dirname, "./src/index.html")
    },
    build: {
      watch: false,
      lib: {
        minify: true,
        entry: path.resolve(__dirname, "./src/index.ts"),
        name: "bhutils",
        fileName: (format) => `billy-herrington-utils.${format}.js`,
      }
    },
  });
};