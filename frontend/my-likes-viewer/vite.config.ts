import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "My Likes Viewer",
        short_name: "Likes",
        theme_color: "#ffffff",
        icons: [
          // アイコンは後で設定する。仮置き。
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // OPFS は Service Worker 内で直接は使えない
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    headers: {
      // @sqlite.org/sqlite-wasm (OPFS) で必須
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
