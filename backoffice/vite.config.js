import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  base: '/plataforma/',
  build: {
    outDir: path.resolve(__dirname, '../public/plataforma'),
    emptyOutDir: true
  }
});
