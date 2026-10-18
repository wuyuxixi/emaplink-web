// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { runAutoWebp } from './scripts/auto-webp.mjs';

function autoWebpPlugin() {
  return {
    name: 'emaplink-auto-webp',
    apply: 'serve',
    /**
     * @param {any} server Vite dev server
     */
    async configureServer(server) {
      await runAutoWebp();

      const paths = [
        fileURLToPath(new URL('./src/content/news', import.meta.url)),
        fileURLToPath(new URL('./public/images/news', import.meta.url)),
      ];
      server.watcher.add(paths);

      /** @type {ReturnType<typeof setTimeout> | undefined} */
      let timer;
      let running = false;
      const run = async () => {
        if (running) return;
        running = true;
        try {
          await runAutoWebp();
        } catch (error) {
          console.error('auto-webp:', error);
        } finally {
          running = false;
        }
      };
      const schedule = () => {
        clearTimeout(timer);
        timer = setTimeout(() => void run(), 500);
      };
      server.watcher.on('all', schedule);
    },
  };
}

export default defineConfig({
  site: 'https://www.emaplink.com.cn',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-high-contrast',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss(), autoWebpPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
