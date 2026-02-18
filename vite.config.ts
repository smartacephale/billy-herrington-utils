import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default () => {
  return defineConfig({
    define: {
      'process.env': {},
    },
    build: {
      target: 'esnext',
      sourcemap: true,
      minify: false,
      lib: {
        entry: path.resolve(__dirname, './src/index.ts'),
        name: 'bhutils',
        fileName: (format) => `billy-herrington-utils.${format}.js`,
      },
    },
    plugins: [dts({ rollupTypes: true })],
  });
};
