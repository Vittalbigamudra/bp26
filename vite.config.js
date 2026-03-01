import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ],

  ssr: {
    // Prevent Vite from trying to SSR-bundle bun:sqlite
    noExternal: ["bun:sqlite"],
    external: []
  },

  optimizeDeps: {
    exclude: ["bun:sqlite"]
  }
});
