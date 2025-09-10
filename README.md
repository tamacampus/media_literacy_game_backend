## セットアップ

### 環境変数の設定

1. `.dev.vars.example`を`.dev.vars`にコピー
2. Google Gemini APIキーを設定

```bash
cp .dev.vars.example .dev.vars
# .dev.varsファイルを編集してGOOGLE_API_KEYを設定
```

### 開発環境の起動

```txt
npm install
npm run dev
```

### 本番環境へのデプロイ

本番環境では、Wrangler CLIまたはCloudflareダッシュボードから環境変数を設定してください：

```bash
# 環境変数をWrangler CLIで設定
wrangler secret put GOOGLE_API_KEY

# デプロイ
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
