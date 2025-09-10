# Media Literacy Game Backend

メディアリテラシーの観点からテキストを分析するAPIサーバー。Google Gemini AIを活用して、SNS投稿文や謝罪文の適切性を評価します。

## 🎯 プロジェクト概要

このプロジェクトは、メディアリテラシー教育を目的としたWebアプリケーションのバックエンドAPIです。ユーザーが入力したテキストをAIが分析し、情報の信頼性、偏見、プライバシーへの配慮などの観点から評価を行います。

### 主な機能

- **投稿文分析**: SNS投稿をメディアリテラシーの観点から評価
- **謝罪文分析**: 企業や公人の謝罪文の適切性を評価
- **リスクレベル判定**: 5段階（very low〜very high）でリスクを評価

## 🏗️ アーキテクチャ

### 技術スタック

- **ランタイム**: [Bun](https://bun.sh/) - 高速なJavaScriptランタイム
- **フレームワーク**: [Hono](https://hono.dev/) - 軽量で高速なWebフレームワーク
- **デプロイ基盤**: [Cloudflare Workers](https://workers.cloudflare.com/) - エッジコンピューティングプラットフォーム
- **AI**: [Google Gemini API](https://ai.google.dev/) - 構造化出力対応の生成AI。APIの費用が他社と比べて安価であり、無料枠もある。

### なぜこの技術スタックなのか？

- **Bun + Hono**: TypeScriptネイティブサポートで型安全性を確保しつつ、高速な実行環境を実現
- **Cloudflare Workers**: グローバルなエッジロケーションで低レイテンシを実現（日本からのアクセスに最適化）。さらに、無料枠が充実しており、この規模のプロジェクトなら（人気になりすぎない限り）無料で運用可能
- **Gemini 2.5 Flash**: 高速なレスポンスと構造化出力（JSON Schema）による型安全なレスポンス。他社より圧倒的に安価であり、無料枠も存在するため、今回の用途に最適

## 📁 プロジェクト構造

```
media-literacy-game-backend/
├── src/
│   ├── index.ts              # アプリケーションのエントリーポイント
│   ├── routes/               # APIルートの定義
│   │   ├── analyze.ts        # 投稿文分析エンドポイント
│   │   ├── apology.ts        # 謝罪文分析エンドポイント
│   │   ├── health.ts         # ヘルスチェック
│   │   └── mock.ts           # テスト用モックエンドポイント
│   ├── services/             # ビジネスロジック層
│   │   ├── analyzePost.ts    # 投稿文分析ロジック
│   │   ├── analyzeApology.ts # 謝罪文分析ロジック
│   │   ├── geminiClient.ts   # Gemini API共通クライアント
│   │   └── types.ts          # 共通型定義
│   └── types/
│       └── env.ts            # 環境変数の型定義
├── simple-client/            # テスト用クライアントアプリ
├── wrangler.toml            # Cloudflare Workers設定
├── package.json             # 依存関係とスクリプト
└── tsconfig.json            # TypeScript設定
```

## 🚀 セットアップ

### 前提条件

- [Bun](https://bun.sh/) がインストールされていること
- [Google AI Studio](https://aistudio.google.com/app/apikey)でGemini APIキーを取得済み
- Cloudflare アカウント（デプロイする場合）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/tamacampus/media-literacy-game-backend.git
cd media-literacy-game-backend

# 依存関係のインストール
bun install
```

### 環境変数の設定

`.dev.vars`ファイルを作成し、以下の変数を設定：

```bash
# .dev.vars.exampleをコピー
cp .dev.vars.example .dev.vars

# .dev.varsファイルを編集
GOOGLE_API_KEY=your_gemini_api_key_here
```

## 🛠️ 開発

### 開発サーバーの起動

```bash
bun run dev
```

デフォルトで`http://localhost:8787`で起動します。

### 利用可能なスクリプト

```bash
# 開発サーバー起動（ホットリロード対応）
bun run dev

# 本番環境へのデプロイ
bun run deploy

# TypeScriptの型チェック
bun run check

# コードフォーマット（Biome使用）
bun run format

# Cloudflare Workers型定義の生成
bun run cf-typegen
```

## 📡 API エンドポイント

### GET `/`
ヘルスチェック用エンドポイント

**レスポンス例:**
```json
{
  "status": "ok",
  "message": "Media Literacy Game Backend is running"
}
```

### POST `/analyze`
投稿文をメディアリテラシーの観点から分析

**リクエスト:**
```json
{
  "text": "今日は最高の天気！みんな外に出よう！"
}
```

**レスポンス:**
```json
{
  "explanation": "みんなの体調や都合を考えていない一方的な呼びかけです",
  "riskLevel": "medium"
}
```

### POST `/apology`
謝罪文の適切性を分析

**リクエスト:**
```json
{
  "text": "この度は多大なるご迷惑をおかけし、深くお詫び申し上げます。"
}
```

**レスポンス:**
```json
{
  "explanation": "具体的な問題点や改善策が書かれていない形式的な謝罪です",
  "riskLevel": "high"
}
```

### POST `/mock`
テスト用モックエンドポイント（固定レスポンス）

## 🧪 テスト

### APIのテスト（curl使用）

```bash
# ヘルスチェック
curl http://localhost:8787/

# 投稿文分析
curl -X POST http://localhost:8787/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "このニュースは100%真実です！"}'

# 謝罪文分析
curl -X POST http://localhost:8787/apology \
  -H "Content-Type: application/json" \
  -d '{"text": "申し訳ございませんでした。"}'
```

### Webクライアントでのテスト

`simple-client/index.html`をブラウザで開いて、GUIでAPIをテストできます。

## 🏛️ 設計思想

### レイヤードアーキテクチャ

このプロジェクトは明確な責任分離を持つレイヤー構造を採用：

1. **ルート層** (`routes/`): HTTPリクエスト/レスポンスの処理
2. **サービス層** (`services/`): ビジネスロジックとAI連携
3. **共通クライアント層**: 外部API通信の抽象化

### 重要な設計判断

1. **構造化出力の使用**: Gemini APIのJSON Schema機能により型安全性を確保
2. **共通クライアントパターン**: コード重複を避け、保守性を向上
3. **エラーメッセージの日本語化**: ユーザーフレンドリーなエラー表示

## 🚀 本番環境へのデプロイ

### Cloudflare Workersへのデプロイ

```bash
# 環境変数をWrangler CLIで設定
wrangler secret put GOOGLE_API_KEY

# デプロイ実行
bun run deploy
```

### デプロイ後の確認

1. Cloudflareダッシュボードでワーカーのステータスを確認
2. 本番URLでヘルスチェックエンドポイントにアクセス
3. ログとアナリティクスで正常動作を確認

## 📚 学習リソース

### このプロジェクトで学べること

- **エッジコンピューティング**: Cloudflare Workersの実践的な使用方法
- **AIインテグレーション**: 生成AIを実サービスに組み込む方法
- **TypeScript**: 型安全なバックエンド開発
- **API設計**: RESTful APIの設計と実装
- **非同期処理**: Promiseとasync/awaitパターン

### 参考ドキュメント

- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)

## 🤝 コントリビューション

プルリクエストは歓迎します！大きな変更の場合は、まずissueを開いて変更内容について議論してください。

### 開発フロー

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- **フォーマッター**: Biomeを使用（`bun run format`）
- **型チェック**: TypeScript strict mode（`bun run check`）
- **型安全性**: すべての変数と関数に明示的な型注釈を付与し、`any`型の使用は禁止
- **命名規則**: キャメルケース（変数・関数）、パスカルケース（型・インターフェース）
- **コメント**: JSDocスタイルで関数の説明を記述