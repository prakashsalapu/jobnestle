import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow overriding proxy target with environment variable VITE_API_PROXY_TARGET
// Default backend port is 10000 in backend/.env, so use that for local dev.
const proxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:10000';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // preserve path; no rewrite needed
        },
      },
    },
  };
});