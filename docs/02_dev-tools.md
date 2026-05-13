# 開発ツール

## ツール一覧

| ツール | 用途 |
|---|---|
| oxlint | リンター |
| oxfmt | フォーマッター（Oxc プロジェクト） |
| vitest | ユニットテスト |

リント・フォーマット・テストはすべてルートの `package.json` で管理します。

> **注意**: oxfmt は Oxc プロジェクトのフォーマッターです。パッケージ名・API は開発状況に応じて変わる可能性があるため、導入前に [oxc-project/oxc](https://github.com/oxc-project/oxc) で最新情報を確認してください。

---

## インストール

すべてルートに devDependency として追加します。

```bash
# リポジトリルートで実行
npm install --save-dev oxlint oxfmt vitest
```

React コンポーネントのテストが必要になった時点で以下を追加します。

```bash
npm install --save-dev jsdom @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom
```

---

## oxlint

### 設定ファイル（任意）

ルートに `.oxlintrc.json` を作成します。

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "pedantic": "off"
  },
  "env": {
    "browser": true,
    "es2022": true
  },
  "rules": {}
}
```

### npm scripts

ルートの `package.json` に追記します。

```json
"lint": "oxlint ."
```

---

## oxfmt

### npm scripts

```json
"format":       "oxfmt .",
"format:check": "oxfmt --check ."
```

---

## vitest

React Router v7 の `reactRouter()` Vite プラグインはブラウザ用のため、テスト用に別の設定ファイルを用意します。

### 設定ファイル

`vitest.config.ts` を作成します。

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

React コンポーネントのテストが必要になった時点で以下に拡張します。

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "~": new URL("./app", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./app/test/setup.ts"],
  },
});
```

### npm scripts

ルートの `package.json` に追記します。

```json
"test":       "vitest run --config ./frontend/my-likes-viewer/vitest.config.ts",
"test:watch": "vitest     --config ./frontend/my-likes-viewer/vitest.config.ts",
"test:ui":    "vitest --ui --config ./frontend/my-likes-viewer/vitest.config.ts"
```

### テストファイルの配置

コンポーネントのそばに置く方式を推奨します。

```
frontend/my-likes-viewer/app/
  components/
    Pagination.tsx
    Pagination.test.tsx
  utils/
    parseLikesJS.ts
    parseLikesJS.test.ts
```

---

## ルート package.json の全体像

```json
{
  "scripts": {
    "dev":          "npm run dev -w frontend/my-likes-viewer",
    "build":        "npm run build -w frontend/my-likes-viewer",
    "typecheck":    "npm run typecheck -w frontend/my-likes-viewer",
    "lint":         "oxlint ./frontend/my-likes-viewer/app",
    "format":       "oxformat ./frontend/my-likes-viewer/app",
    "format:check": "oxformat --check ./frontend/my-likes-viewer/app",
    "test":         "vitest run --config ./frontend/my-likes-viewer/vitest.config.ts",
    "test:watch":   "vitest     --config ./frontend/my-likes-viewer/vitest.config.ts",
    "test:ui":      "vitest --ui --config ./frontend/my-likes-viewer/vitest.config.ts"
  }
}
```

---

## 追加提案

### lint-staged + husky（プレコミットフック）

コミット前に lint・format チェックを自動実行します。

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit` に以下を記述します。

```sh
npx lint-staged
```

ルートの `package.json` に設定を追記します。

```json
"lint-staged": {
  "frontend/my-likes-viewer/app/**/*.{ts,tsx}": [
    "oxformat --check",
    "oxlint"
  ]
}
```

### VSCode 設定

`.vscode/settings.json` に以下を追記すると、保存時に自動フォーマットされます。

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "oxc.oxformat"
}
```

oxlint の VSCode 拡張は `oxc.oxc-vscode` です。
