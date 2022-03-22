import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    // minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VAuth',
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'vue',
        'vuex',
        'vue-router',
        'axios',
        'pinia',
        'lodash',
        'secure-ls',
        'jwt-decode',
        'js-cookie',
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
      resolve: {
        dedupe: ['vue', 'vue-router'],
      },
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
