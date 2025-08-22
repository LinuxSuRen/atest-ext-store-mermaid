import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

declare global {
  interface Window {
    ATestPlugin?: VuePlugin;
  }
}

interface VuePlugin {
  mount(el?: string, props?: Record<string, any>): void;
  unmount(): void;
}

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
    'global': 'window'
  },
  resolve: {
    alias: {
      'process': 'process/browser'
    }
  },
  build: {
    lib: {
      entry: ('src/main.ts'),
      name: 'ATestPlugin',
      fileName: (format) => `atest-ext-store-mermaid.${format}.js`
    },
    rollupOptions: {
      // external: ['vue'],
      output: {
        inlineDynamicImports: true,
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});