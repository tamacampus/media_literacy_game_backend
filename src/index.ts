import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { ERROR_CODES, ERROR_MESSAGES } from './constants'
// ルーターのインポート
import analyzeRouter from './routes/analyze'
import apologyRouter from './routes/apology'
import healthRouter from './routes/health'
import mockRouter from './routes/mock'
import { AppError } from './services/errors'
import type { Env } from './types/env'
import { createErrorResponse } from './types/responses'

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
  // vValidatorのHTTPException（Valibot形式のエラーを含む）
  if ('getResponse' in err && typeof err.getResponse === 'function') {
    const response = err.getResponse()
    if (response.status === 400) {
      // バリデーションエラーをそのまま返す
      return response
    }
  }

  // カスタムエラーの場合
  if (err instanceof AppError) {
    c.status(err.statusCode)
    return c.json(createErrorResponse(err.userMessage, err.errorCode))
  }

  // 予期しないエラーの場合
  console.error('[Global Error Handler]', err)
  c.status(500)
  return c.json(createErrorResponse(ERROR_MESSAGES.SERVER_ERROR, ERROR_CODES.SERVER_ERROR))
})

/**
 * 404ハンドラー
 * 定義されていないエンドポイントへのリクエストを処理
 */
app.notFound((c) => {
  c.status(404)
  return c.json({
    error: 'エンドポイントが見つかりません',
    errorCode: 'NOT_FOUND',
    path: c.req.path,
    timestamp: new Date().toISOString(),
  })
})

/**
 * Cloudflare Workersエントリポイント
 * Cloudflare Workersは、エクスポートされたオブジェクトのfetchハンドラを期待する
 */
export default {
  fetch: app.fetch,
}
