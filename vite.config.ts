import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/umd-entry.ts'),
      name: 'MusicPlayground',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => {
        if (format === 'es') {
          return 'music-playground.esm.js';
        }
        return `music-playground.${format}.js`;
      },
    },
    rollupOptions: {
      // Bundle all dependencies to make it easier to use
      // Users don't need to install tone or soundfont-player separately
      output: {
        // Ensure themes are included in the bundle
        preserveModules: false,
      },
    },
    // Increase chunk size warning limit since we're bundling everything
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'dist/**',
        'node_modules/**'
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    },
    testTimeout: 5000,
    hookTimeout: 5000,
  },
});
