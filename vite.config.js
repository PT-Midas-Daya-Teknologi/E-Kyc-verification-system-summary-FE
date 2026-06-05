import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  css: {
    preprocessorOptions: {
      // No custom preprocessor config needed for Tailwind
    },
  },
  server: {
    port: 3001
  },
});
