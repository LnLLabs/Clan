import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'node_modules/**', 'src/**/*.css'],
      copyDtsFiles: false,
      staticImport: true,
      rollupTypes: true,
      skipDiagnostics: true,
    })
  ],
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ClanFrameworkComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@clan/framework-core',
        '@clan/framework-providers',
        '@clan/framework-helpers'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Preserve exports structure
        preserveModules: false,
        exports: 'named',
        // Ensure CSS is bundled
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles/index.css';
          return assetInfo.name || '';
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@clan/framework-core': resolve(__dirname, '../core/dist/index'),
      '@clan/framework-providers': resolve(__dirname, '../providers/dist/index'),
      '@clan/framework-helpers': resolve(__dirname, '../helpers/dist/index'),
    }
  }
});

