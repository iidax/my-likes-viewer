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

また、React Router が `/my-likes-viewer/` を未知のパスと判断して 404 を返さないようにする。

```ts
// frontend/my-likes-viewer/react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/my-likes-viewer/",
} satisfies Config;
```

---

## 3. GitHub Pages の設定

GitHub リポジトリの **Settings → Pages** を開き、以下を設定します。

- **Source**: `GitHub Actions`

### Environment 保護ルールにタグを追加する

GitHub Pages の Environment はデフォルトで `main` ブランチからのデプロイのみ許可しています。
タグ（`v*`）からもデプロイできるようにするため、以下の手順で設定します。

1. リポジトリ → **Settings** → **Environments** → `github-pages` をクリック
2. **Deployment branches and tags** セクションで **Add deployment branch or tag rule** をクリック
3. **Ref type** を `Tag` に切り替え、パターンに `v*` を入力して **Add rule** をクリック
4. ページ下部の **Save protection rules** で保存

> この設定をしないと、タグ push 時に「Tag is not allowed to deploy to github-pages due to environment protection rules」エラーでデプロイが拒否されます。

---

## 4. GitHub Actions ワークフローの作成

`.github/workflows/deploy.yml` を作成します。

---

## 5. セキュリティチェック一覧

| チェック | タイミング | 内容 |
|---|---|---|
| `npm audit` | PR・push 毎 | 依存パッケージの既知脆弱性（high 以上で失敗） |
| TypeScript 型チェック | PR・push 毎 | 型エラーによるビルド失敗を事前検出 |
| CodeQL | PR・push 毎 | XSS・インジェクション等の静的解析 |

> **補足**: シークレット漏洩チェックが必要な場合は [TruffleHog Action](https://github.com/trufflesecurity/trufflehog) の追加を検討してください。

---

## 6. git tag によるバージョン管理

[セマンティックバージョニング](https://semver.org/lang/ja/) に従ってタグを付け、リリースを管理します。

### バージョン体系

```
v<MAJOR>.<MINOR>.<PATCH>
例: v1.0.0, v1.1.0, v1.1.1
```

| 種別 | 変更例 |
|---|---|
| MAJOR | 破壊的変更（UI の大幅刷新など） |
| MINOR | 後方互換のある機能追加 |
| PATCH | バグ修正・軽微な変更 |

### タグの作成と push

```bash
# 現在のタグ一覧を確認
git tag

# 注釈付きタグを作成（リリースノートを残せるのでこちら推奨）
git tag -a v1.0.0 -m "v1.0.0: 初回リリース"

# タグを GitHub に push
git push origin v1.0.0

# まとめて全タグを push する場合
git push origin --tags
```

### GitHub Release の作成（任意）

```bash
# gh CLI でタグからリリースを作成
gh release create v1.0.0 --title "v1.0.0" --notes "初回リリース"
```

### タグトリガーのデプロイ（オプション）

`deploy.yml` の `on:` に以下を追加すると、`v*` タグ push 時のみデプロイを実行できます。

```yaml
on:
  push:
    tags:
      - "v*"
```

> **補足**: `main` へのマージは自動デプロイ、タグは公式リリースとして使い分けるのも一般的です。

---

## 7. 初回デプロイ

```bash
git add .github/workflows/deploy.yml frontend/my-likes-viewer/vite.config.ts docs/01_release.md
git commit -m "ci: add GitHub Pages deploy workflow with security checks"
git push origin main

# 初回リリースタグを付ける
git tag -a v1.0.0 -m "v1.0.0: 初回リリース"
git push origin v1.0.0
```

push 後、GitHub Actions タブでワークフローの進行を確認できます。  
デプロイ完了後 `https://iidax.github.io/my-likes-viewer/` でアクセス可能になります。
