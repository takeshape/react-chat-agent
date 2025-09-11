import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.lib.json')
    })
  ],
  envDir: __dirname,
  worker: {
    format: 'es'
  },
  base: './',
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        markdown: resolve(__dirname, 'src/blocks/markdown.tsx'),
        option: resolve(__dirname, 'src/blocks/option.tsx')
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'index.[ext]'
      }
    }
  },
  test: {
    environment: 'jsdom'
  }
});
