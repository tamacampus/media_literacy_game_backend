import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env } from './types/env'

// ルーターのインポート
import analyzeRouter from './routes/analyze'
import apologyRouter from './routes/apology'
import healthRouter from './routes/health'
import mockRouter from './routes/mock'

/**
 * Honoアプリケーションのインスタンスを作成
 * Honoは軽量で高速なWebフレームワーク
 */
const app = new Hono<{ Bindings: Env }>()

/**
 * ミドルウェアの設定
 */

// CORS（Cross-Origin Resource Sharing）ミドルウェア
// 異なるオリジンからのリクエストを許可する
app.use('*', cors())

// ロガーミドルウェア
// リクエストとレスポンスの情報をコンソールに出力
app.use('*', logger())

/**
 * ルーティングの設定
 * 各エンドポイントを対応するルーターに接続
 */

// ヘルスチェックエンドポイント（ルート）
app.route('/', healthRouter)

// 投稿分析エンドポイント
app.route('/', analyzeRouter)

// 謝罪文分析エンドポイント
app.route('/', apologyRouter)

// モックエンドポイント（テスト用）
app.route('/', mockRouter)

/**
 * グローバルエラーハンドリング
 * 各エンドポイントで処理されなかったエラーをキャッチ
 */
app.onError((err, c) => {
  // エラーレスポンスを返す
  return c.json(
    {
      error: 'サーバーエラーが発生しました',
      details: err.message,
    },
    500 // Internal Server Error
  )
})

/**
 * 404ハンドラー
 * 定義されていないエンドポイントへのリクエストを処理
 */
app.notFound((c) => {
  return c.json(
    {
      error: 'エンドポイントが見つかりません',
      path: c.req.path, // デバッグ用：リクエストされたパスを含める
    },
    404
  )
})

/**
 * Cloudflare Workersエントリポイント
 * Cloudflare Workersは、エクスポートされたオブジェクトのfetchハンドラを期待する
 */
export default {
  fetch: app.fetch,
}
