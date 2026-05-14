# セットアップ手順

## Step 1: React Router v7 の初期化

```bash
npx create-react-router@latest frontend/my-likes-viewer

```

対話プロンプトへの回答:
- `Initialize a new git repository?` → **No**（既に `.git` あり）
- `Install dependencies?` → **No**

生成されるファイル:

```
app/
  root.tsx
  routes/home.tsx
react-router.config.ts
vite.config.ts
tsconfig.json
package.json
```

```
cd frontend/my-likes-viewer
npm i
```


## Step 2: SPA モードに設定

`react-router.config.ts` に `ssr: false` を追加する。


## Step 3: 追加パッケージのインストール

```bash
# SQLite WASM
npm install @sqlite.org/sqlite-wasm

# PWA
npm install -D vite-plugin-pwa
```


## Step 4: Vite の設定変更

`vite.config.ts` を以下に書き換える:

```ts
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
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
```


## Step 5: プロジェクト構造の整備

React Router v7 の慣習に従い、共有ロジックは `app/lib/` に置く。

```bash
mkdir -p app/components app/lib/db app/utils
```


## Step 6: DB スキーマ・ユーティリティの実装

| ファイル | 内容 |
|---|---|
| `app/lib/db/migrations/0001_init.sql` | 初期スキーマ（Vite の `?raw` import で読み込む） |
| `app/lib/db/migrate.ts` | マイグレーション実行（`import.meta.glob` で自動収集） |
| `app/lib/db/worker.ts` | SQLite WASM を Web Worker 内で初期化・操作する |
| `app/lib/db/client.ts` | Worker へのメッセージングをラップした DB クライアント |
| `app/lib/db/likes.ts` | likes の CRUD |
| `app/utils/snowflake.ts` | tweetId → Date の変換 |
| `app/utils/parseLikesJS.ts` | like.js → Like[] パーサー |

新しいマイグレーションを追加する場合は `migrations/` に `0002_xxx.sql` を置くだけでよい。


## Step 7: ルート・コンポーネントの実装

| ファイル | パス | 内容 |
|---|---|---|
| `app/routes/home.tsx` | `/` | いいね一覧・フィルター・ページネーション |
| `app/routes/upload.tsx` | `/upload` | like.js アップロード |
| `app/routes/settings.tsx` | `/settings` | X API キー設定・DBクリア |
| `app/components/LikeItem.tsx` | - | 1件表示 |
| `app/components/LikesList.tsx` | - | リスト表示 |
| `app/components/Pagination.tsx` | - | ページネーション |
| `app/components/DateFilter.tsx` | - | 日付フィルター |


## Step 8: PWA 対応

- `public/icons/` にアイコンを配置（512×512, 192×192 推奨）
- `manifest.webmanifest` は `vite-plugin-pwa` がビルド時に自動生成するため手動作成不要


## Step 9: PWA の動作確認

`vite-plugin-pwa` は **開発サーバーではサービスワーカーを登録しない**。PWA として動作確認するには本番ビルドをローカルで配信する必要がある。

### 手順

```bash
# 1. 本番ビルド
npm run build
# → build/client/ に出力される（SPA モードのため build/server/ は自動削除）

# 2. ローカルで静的配信
npx serve build/client
```

> `npm run start`（react-router-serve）は SPA モードでサーバービルドが存在しないため使用不可。

### 確認ポイント

| 確認項目 | 場所 |
|---|---|
| マニフェスト・アイコン | DevTools > Application > Manifest |
| サービスワーカー登録 | DevTools > Application > Service Workers |
| インストールプロンプト | アドレスバー右端のインストールボタン（Chrome） |
| オフライン動作 | DevTools > Network > Offline にして再読み込み |
