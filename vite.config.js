import path from "node:path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default ({ mode }) => {
  return defineConfig({
    define: {
      "process.env": {},
    },
    build: {
      sourcemap: true,
      minify: false,
      lib: {
        // minify: false,
        entry: path.resolve(__dirname, "./src/index.ts"),
        name: "bhutils",
        fileName: (format) => `billy-herrington-utils.${format}.js`,
      }
    },
    plugins: [dts({ rollupTypes: true })]
  });
};