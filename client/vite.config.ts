import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vite configuration.
 *
 * The dev server proxies every `/api` request to the NetCar backend so the SPA
 * and API appear same-origin in the browser — this is what lets the httpOnly
 * refresh-token cookie flow work without any CORS friction. The proxy target is
 * configurable via VITE_API_PROXY_TARGET and defaults to port 3002.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:3002';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
    },
  };
});
