import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'node_modules/**'],
      copyDtsFiles: false,
      staticImport: true,
      rollupTypes: true,
      skipDiagnostics: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ClanFrameworkReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-query',
        '@clan/framework-core',
        '@clan/framework-components',
        '@clan/framework-helpers',
        '@clan/framework-providers'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tanstack/react-query': 'ReactQuery'
        },
        preserveModules: false,
        exports: 'named'
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});

