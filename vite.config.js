import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      generateBundle() {
        const manifestPath = resolve(__dirname, 'manifest.json');
        const destPath = resolve(__dirname, 'dist', 'manifest.json');
        mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
        copyFileSync(manifestPath, destPath);
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'index.html',
        background: 'src/background.js',
        contentScript: 'src/contentScript.js',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
    port: 5173,
  },
});
