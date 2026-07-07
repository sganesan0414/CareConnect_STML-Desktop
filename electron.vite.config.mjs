import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// electron-vite builds three targets: the main process, the preload script and
// the React renderer. Default entry points are src/main/index.js,
// src/preload/index.js and src/renderer/index.html.
//
// `@shared` resolves to src/shared for cross-process code (IPC channel names,
// route paths); `@` resolves to the renderer source root.
const shared = resolve('src/shared');

export default defineConfig({
  main: {
    resolve: {
      alias: { '@shared': shared },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    resolve: {
      alias: { '@shared': shared },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@shared': shared,
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
        },
      },
    },
    plugins: [react()],
  },
});
