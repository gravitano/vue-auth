import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    // minify: false,
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'VAuth',
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      plugins: [
        {
          name: 'remove-collection-handlers',
          transform(code, id) {
            if (id.endsWith('reactivity.esm-bundler.js')) {
              return code
                .replace(`mutableCollectionHandlers,`, `null,`)
                .replace(`readonlyCollectionHandlers,`, `null,`);
            }
          },
        },
      ],
    },
  },
});
