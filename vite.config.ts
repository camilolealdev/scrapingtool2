import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: () => '/v1/messages',
      },
      '/api/bing': {
        target: 'https://api.bing.microsoft.com',
        changeOrigin: true,
        rewrite: (path) => '/v7.0/search' + path.replace(/^\/api\/bing/, ''),
      },
      '/api/brave': {
        target: 'https://api.search.brave.com',
        changeOrigin: true,
        rewrite: (path) => '/res/v1/web/search' + path.replace(/^\/api\/brave/, ''),
      },
      '/api/firecrawl': {
        target: 'https://api.firecrawl.dev',
        changeOrigin: true,
        rewrite: () => '/v1/search',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'motion/react'],
          'vendor-ui': ['lucide-react'],
          'vendor-ai': ['@google/genai'],
        },
      },
    },
  },
});
