import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    exclude: [
      'node_modules/**',
      '.kilo/**',
      '.opencode/**',
      '.agents/**',
      'dist/**',
      'src/state-machine/**',
    ],
  },
});
