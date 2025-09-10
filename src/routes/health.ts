import { Hono } from 'hono'

/**
 * ヘルスチェック用のルーター
 * APIサーバーが正常に動作しているかを確認するためのエンドポイント
 */
const healthRouter = new Hono()

/**
 * GET /
 * サーバーの稼働状態を確認するエンドポイント
 *
 * @returns {Object} - サーバーのステータス情報
 * - message: サーバーの説明
 * - status: 'running' (稼働中)
 */
healthRouter.get('/', (c) => {
  // JSONレスポンスを返す
  return c.json({
    message: 'メディアリテラシー評価APIサーバー',
    status: 'running',
  })
})

export default healthRouter
