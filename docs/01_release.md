# GitHub Pages リリース手順

## 概要

このプロジェクト（React Router v7 SPA + PWA）を GitHub Pages で公開するための手順です。
セキュリティチェックを CI に組み込み、安全にデプロイします。

---

## 1. GitHub リポジトリの準備

```bash
# リポジトリ作成（未作成の場合）
gh repo create iidax/my-likes-viewer --public

# リモート登録
git remote add origin https://github.com/iidax/my-likes-viewer.git
git push -u origin main
```

---

## 2. Vite の base 設定

GitHub Pages は `https://iidax.github.io/my-likes-viewer/` で配信されるため、
`vite.config.ts` に `base` を追加します。

```ts
// frontend/my-likes-viewer/vite.config.ts
export default defineConfig({
  base: "/my-likes-viewer/",
  // ...
});
```

---

## 3. GitHub Pages の設定

GitHub リポジトリの **Settings → Pages** を開き、以下を設定します。

- **Source**: `GitHub Actions`

---

## 4. GitHub Actions ワークフローの作成

`.github/workflows/deploy.yml` を作成します。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  security:
    name: Security Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/my-likes-viewer/package-lock.json

      - name: Install dependencies
        working-directory: frontend/my-likes-viewer
        run: npm ci

      # 依存パッケージの脆弱性チェック（高・重大のみ失敗）
      - name: npm audit
        working-directory: frontend/my-likes-viewer
        run: npm audit --audit-level=high

      # 型チェック
      - name: Type check
        working-directory: frontend/my-likes-viewer
        run: npm run typecheck

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    needs: [security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/my-likes-viewer/package-lock.json

      - name: Install dependencies
        working-directory: frontend/my-likes-viewer
        run: npm ci

      - name: Build
        working-directory: frontend/my-likes-viewer
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/my-likes-viewer/build/client

      - id: deployment
        name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## 5. セキュリティチェック一覧

| チェック | タイミング | 内容 |
|---|---|---|
| `npm audit` | PR・push 毎 | 依存パッケージの既知脆弱性（high 以上で失敗） |
| TypeScript 型チェック | PR・push 毎 | 型エラーによるビルド失敗を事前検出 |
| CodeQL | PR・push 毎 | XSS・インジェクション等の静的解析 |

> **補足**: シークレット漏洩チェックが必要な場合は [TruffleHog Action](https://github.com/trufflesecurity/trufflehog) の追加を検討してください。

---

## 6. 初回デプロイ

```bash
git add .github/workflows/deploy.yml frontend/my-likes-viewer/vite.config.ts docs/01_release.md
git commit -m "ci: add GitHub Pages deploy workflow with security checks"
git push origin main
```

push 後、GitHub Actions タブでワークフローの進行を確認できます。  
デプロイ完了後 `https://iidax.github.io/my-likes-viewer/` でアクセス可能になります。
