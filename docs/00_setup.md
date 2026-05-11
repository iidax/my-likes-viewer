# セットアップ手順

## Step 1: React Router v7 の初期化

```bash
npx create-react-router@latest .
```

対話プロンプトへの回答:
- `Initialize a new git repository?` → **No**（既に `.git` あり）
- `Install dependencies?` → **Yes**

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

`vite.config.ts` に以下を追加する:

1. **COOP / COEP ヘッダー** — `@sqlite.org/sqlite-wasm` の OPFS モードに必須
2. **vite-plugin-pwa** — Service Worker・manifest の生成


## Step 5: プロジェクト構造の整備

```bash
mkdir -p app/components app/db app/utils
```


## Step 6: DB スキーマ・ユーティリティの実装

| ファイル | 内容 |
|---|---|
| `app/db/client.ts` | SQLite WASM シングルトン初期化 |
| `app/db/schema.ts` | CREATE TABLE 定義 |
| `app/db/likes.ts` | likes の CRUD |
| `app/utils/snowflake.ts` | tweetId → Date の変換 |
| `app/utils/parseLikesJS.ts` | likes.js → Like[] パーサー |


## Step 7: ルート・コンポーネントの実装

| ファイル | パス | 内容 |
|---|---|---|
| `app/routes/home.tsx` | `/` | いいね一覧・フィルター・ページネーション |
| `app/routes/upload.tsx` | `/upload` | likes.js アップロード |
| `app/routes/settings.tsx` | `/settings` | X API キー設定 |
| `app/components/LikeItem.tsx` | - | 1件表示 |
| `app/components/LikesList.tsx` | - | リスト表示 |
| `app/components/Pagination.tsx` | - | ページネーション |
| `app/components/DateFilter.tsx` | - | 日付フィルター |


## Step 8: PWA 対応

- `public/manifest.webmanifest` を作成
- `public/icons/` にアイコンを配置（512×512, 192×192 推奨）
