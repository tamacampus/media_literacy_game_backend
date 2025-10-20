# Media Literacy Game Backend

メディアリテラシーの観点からテキストを分析するAPIサーバー。Google Gemini AIを活用して、SNS投稿文や謝罪文の適切性を評価します。

## 🎯 プロジェクト概要

このプロジェクトは、メディアリテラシー教育を目的としたティラノビルダー製ゲームのバックエンドAPIです。ユーザーが入力したテキストをAIが分析し、情報の信頼性、偏見、プライバシーへの配慮などの観点から評価を行います。

[ティラノビルダー向けプラグインはこちら](https://github.com/tamacampus/media_literacy_analyzer)

### 主な機能

- **投稿文分析**: SNS投稿をメディアリテラシーの観点から評価
- **謝罪文分析**: 企業や公人の謝罪文の適切性を評価
- **リスクレベル判定**: 5段階（very low〜very high）でリスクを評価
- **分析結果の保存**: 研究・分析目的で分析結果をCloudflare D1データベースに保存可能

## 🏗️ アーキテクチャ

### 技術スタック

- **ランタイム**: [Bun](https://bun.sh/) - 高速なJavaScriptランタイム
- **フレームワーク**: [Hono](https://hono.dev/) - 軽量で高速なWebフレームワーク
- **デプロイ基盤**: [Cloudflare Workers](https://workers.cloudflare.com/) - エッジコンピューティングプラットフォーム
- **AI**: [Google Gemini API](https://ai.google.dev/) - 構造化出力対応の生成AI。APIの費用が他社と比べて安価であり、無料枠もある。
- **データベース**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLiteベースのサーバーレスデータベース
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - TypeScript-firstの軽量ORM

### なぜこの技術スタックなのか？

- **Bun + Hono**: TypeScriptネイティブサポートで型安全性を確保しつつ、高速な実行環境を実現
- **Cloudflare Workers**: グローバルなエッジロケーションで低レイテンシを実現（日本からのアクセスに最適化）。さらに、無料枠が充実しており、この規模のプロジェクトなら（人気になりすぎない限り）無料で運用可能
- **Gemini 2.5 Flash**: 高速なレスポンスと構造化出力（JSON Schema）による型安全なレスポンス。他社より圧倒的に安価であり、無料枠も存在するため、今回の用途に最適

## 📁 プロジェクト構造

```
media-literacy-game-backend/
├── src/
│   ├── index.ts                  # アプリケーションのエントリーポイント
│   ├── routes/                   # APIルートの定義
│   │   ├── analyze.ts            # 投稿文分析エンドポイント
│   │   ├── apology.ts            # 謝罪文分析エンドポイント
│   │   ├── health.ts             # ヘルスチェック
│   │   └── mock.ts               # テスト用モックエンドポイント
│   ├── services/                 # ビジネスロジック層
│   │   ├── analyzePost.ts        # 投稿文分析ロジック
│   │   ├── analyzeApology.ts     # 謝罪文分析ロジック
│   │   ├── geminiClient.ts       # Gemini API共通クライアント
│   │   ├── saveAnalysisResult.ts # DB保存サービス
│   │   └── types.ts              # 共通型定義
│   ├── db/                       # データベース関連
│   │   └── schema.ts             # Drizzle ORMスキーマ定義
│   ├── validators/               # バリデーション層
│   │   └── validation-schemas.ts # Valibotスキーマ定義
│   └── types/
│       └── env.ts                # 環境変数の型定義
├── migrations/                   # D1データベースマイグレーション
├── simple-client/                # テスト用クライアントアプリ
├── drizzle.config.ts             # Drizzle ORM設定
├── wrangler.jsonc                # Cloudflare Workers設定
├── package.json                  # 依存関係とスクリプト
└── tsconfig.json                 # TypeScript設定
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

# Drizzleマイグレーションファイルの生成
bun run db:generate

# ローカルD1データベースにマイグレーション適用（課金なし）
# migrations/ ディレクトリ内のすべてのマイグレーションを順番に適用
bun run db:migrate:local

# 本番環境D1データベースにマイグレーション適用
# migrations/ ディレクトリ内のすべてのマイグレーションを順番に適用
bun run db:migrate:production
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
  "text": "今日は最高の天気！みんな外に出よう！",
  "context": "投稿者は大学生で、SNSでの影響力は小さい（任意）",
  "shouldSave": true  // 任意: trueの場合、分析結果をD1データベースに保存（デフォルト: false）
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
  "text": "この度は多大なるご迷惑をおかけし、深くお詫び申し上げます。",
  "context": "大手企業のCEOによる謝罪文（任意）",
  "shouldSave": true  // 任意: trueの場合、分析結果をD1データベースに保存（デフォルト: false）
}
```

**レスポンス:**
```json
{
  "explanation": "具体的な問題点や改善策が書かれていない形式的な謝罪です",
  "riskLevel": "high"
}
```

**パラメータ:**
- `text` (必須): 分析対象のテキスト
- `context` (任意): 投稿者や状況に関する背景情報（最大1000文字）
- `shouldSave` (任意): `true`の場合、分析結果をデータベースに保存（デフォルト: `false`）

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

### 簡易Webクライアントでのテスト

`simple-client/index.html`をブラウザで開いて、GUIでAPIをテストできます。

## 💾 データベースと分析結果の取得

### D1データベースのセットアップ

#### 1. ローカル開発環境のセットアップ

```bash
# ローカルDBにマイグレーションを適用
# migrations/ ディレクトリ内のすべてのマイグレーションファイルが順番に適用されます
bun run db:migrate:local

# 開発サーバーを起動（.wrangler/state/v3/d1 にローカルDBが作成されます）
bun run dev
```

#### 2. 本番環境用のD1データベースを作成

```bash
# 本番用D1データベースを作成（リモート）
bunx wrangler d1 create media-literacy-db
```

コマンド実行後、出力される`database_id`をコピーして、`wrangler.jsonc`の本番環境設定に貼り付けてください：

```jsonc
"env": {
  "production": {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "media-literacy-db",
        "database_id": "ここに本番環境のdatabase_idを貼り付け"
      }
    ]
  }
}
```

#### 3. 本番環境にマイグレーションを適用

```bash
# 本番環境D1データベースにマイグレーション適用
# migrations/ ディレクトリ内のすべてのマイグレーションファイルが順番に適用されます
bun run db:migrate:production
```

### 保存されたデータの取得方法

```bash
# 本番環境から全データを取得
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results ORDER BY created_at DESC"
```

#### 特定期間のデータのみ取得

```bash
# 本番環境から特定期間のデータを取得
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results WHERE created_at >= 1729382400000 ORDER BY created_at DESC"
```

> **Note**: `created_at`はUnixタイムスタンプ（ミリ秒）です。[Epoch Converter](https://www.epochconverter.com/)などで日時を変換できます。

#### エンドポイント種別でフィルタリング

```bash
# 投稿文分析のみ（本番環境）
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results WHERE endpoint_type = 'analyze'"

# 謝罪文分析のみ（本番環境）
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results WHERE endpoint_type = 'apology'"
```

#### リスクレベル別の集計

```bash
# 本番環境のデータを集計
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT risk_level, COUNT(*) as count FROM analysis_results GROUP BY risk_level"
```

#### JSON形式で出力

```bash
# 本番環境のデータをJSON形式で出力
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results" \
  --json > results.json
```

#### CSV形式で出力

```bash
# jqコマンドが必要です（macOS: brew install jq, Windows: choco install jq）
bunx wrangler d1 execute media-literacy-db --remote --env production \
  --command "SELECT * FROM analysis_results" \
  --json | jq -r '.[] | [.id, .endpoint_type, .input_text, .context, .explanation, .risk_level, .created_at] | @csv' > results.csv
```

### データベーススキーマ

`analysis_results`テーブルの構造：

| カラム名        | 型      | 説明                                                                       |
| --------------- | ------- | -------------------------------------------------------------------------- |
| `id`            | INTEGER | 主キー（自動採番）                                                         |
| `endpoint_type` | TEXT    | エンドポイント種別（`"analyze"` または `"apology"`）                       |
| `input_text`    | TEXT    | 分析対象のテキスト                                                         |
| `context`       | TEXT    | 文脈情報（任意、NULL可）                                                   |
| `explanation`   | TEXT    | AI分析結果の説明                                                           |
| `risk_level`    | TEXT    | リスクレベル（`"very low"`, `"low"`, `"medium"`, `"high"`, `"very high"`） |
| `created_at`    | INTEGER | 作成日時（Unixタイムスタンプ、ミリ秒）                                     |

### スキーマ変更とマイグレーション

将来的にデータベーススキーマを変更する場合の手順：

```bash
# 1. src/db/schema.ts を編集してスキーマを変更

# 2. 新しいマイグレーションファイルを生成
bun run db:generate
# → migrations/ ディレクトリに新しいSQLファイルが作成されます（例: 0001_*.sql）

# 3. ローカルDBに新しいマイグレーションを適用してテスト
bun run db:migrate:local

# 4. ローカルで動作確認
bun run dev

# 5. 問題なければ本番環境に適用
bun run db:migrate:production
```

**重要**: `wrangler d1 migrations apply`コマンドは、未適用のマイグレーションのみを実行します。既に適用済みのマイグレーションは自動的にスキップされるため、安全に何度でも実行できます。マイグレーション履歴は`__d1_migrations`テーブルで管理されます。

## 🏛️ 設計思想

### レイヤードアーキテクチャ

このプロジェクトは明確な責任分離を持つレイヤー構造を採用：

1. **ルート層** (`routes/`): HTTPリクエスト/レスポンスの処理
2. **サービス層** (`services/`): ビジネスロジックとAI連携
3. **共通クライアント層**: 外部API通信の抽象化

## 🚀 本番環境へのデプロイ

### Cloudflare Workersへのデプロイ
[wrangler.jsonc](https://github.com/tamacampus/media_literacy_game_backend/blob/main/wrangler.jsonc)でカスタムドメインが設定されているため、私以外の環境ではデプロイに失敗します。設定を削除するか、ご自身のドメインに置き換えてください。

```bash
# 1. wranglerへのログイン
bunx wrangler login

# 2. 本番環境用D1データベースを作成
bunx wrangler d1 create media-literacy-db
# 出力されたdatabase_idをwrangler.jsonc の env.production.d1_databases[0].database_id に設定

# 3. 本番環境D1データベースにマイグレーション適用
# migrations/ ディレクトリ内のすべてのマイグレーションが順番に適用されます
bun run db:migrate:production

# 4. 本番環境用の環境変数をWrangler CLIで設定
bunx wrangler secret put GOOGLE_API_KEY --env production

# 5. 本番環境へデプロイ実行
bun run deploy
```

### デプロイ後の確認

1. Cloudflareダッシュボードでワーカーのステータスを確認
2. 本番URLでヘルスチェックエンドポイントにアクセス
3. ログとアナリティクスで正常動作を確認
4. D1データベースがバインディングされているか確認

### 開発フロー（課金を抑える）

```bash
# 1. ローカル開発サーバーで動作確認
bun run dev  # .wrangler/state にローカルDBが作成される

# 2. ローカルでテストデータを保存して動作確認
curl -X POST http://localhost:8787/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "テスト投稿", "shouldSave": true}'

# 3. ローカルDBのデータを確認
bunx wrangler d1 execute media-literacy-db --local \
  --command "SELECT * FROM analysis_results"

# 4. 十分にテストした後、本番環境にデプロイ
bun run deploy
```

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
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
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
