import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['storage'],
  },
  modules: ['@wxt-dev/module-react'],
  react: {
    vite: {
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              target: '19',
            },
          ],
        ],
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'), // or "./src" if using src directory
      },
    },
  }),
});
