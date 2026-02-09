// import { defineConfig } from 'vitest/config'
// import { fileURLToPath } from 'url'
// import { resolve } from 'path'

// const root = fileURLToPath(new URL('.', import.meta.url))

// export default defineConfig({
//   test: {
//     environment: 'jsdom',
//     setupFiles: [resolve(root, 'setupTests.mjs')],
//     globals: true,
//     include: ['unitTest/**/*.{test,spec}.{js,jsx}'],
//   },
//   resolve: {
//     alias: {
//       '@': resolve(root, '.'),
//     },
//   },
// })

// ///

// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: ['./setupTests.mjs'],
//     coverage: {
//       provider: 'v8',
//       reporter: ['text', 'json', 'html'],
//       exclude: [
//         'node_modules/',
//         'dist/',
//         '.next/',
//         '**/*.test.js',
//         '**/*.test.jsx',
//       ],
//     },
//   },
// });

// ///

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.mjs'],
    include: [
      'unitTest/**/*.test.{js,jsx}',
      '__tests__/integration/**/*.test.{js,jsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.js',
        '**/*.test.jsx',
      ],
    },
  },
});