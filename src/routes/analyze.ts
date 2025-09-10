import { Hono } from 'hono'
import { analyzePost } from '../services/analyzePost'
import type { Env } from '../types/env'

/**
 * 投稿分析用のルーター
 * SNSなどの投稿文をメディアリテラシーの観点から分析
 */
const analyzeRouter = new Hono<{ Bindings: Env }>()

/**
 * POST /analyze
 * 投稿文をメディアリテラシーの観点から分析するエンドポイント
 *
 * @param {Object} body - リクエストボディ
 * @param {string} body.text - 分析対象のテキスト
 *
 * @returns {Object} - 分析結果
 * - success: true/false - 処理の成功/失敗
 * - analysis: 分析結果オブジェクト
 *   - explanation: 分析結果の説明文
 *   - riskLevel: リスクレベル（5段階）
 * - timestamp: レスポンス生成時刻（ISO形式）
 *
 * @throws {400} テキストが空または不正な場合
 * @throws {500} 分析処理でエラーが発生した場合
 */
analyzeRouter.post('/analyze', async (c) => {
  try {
    // リクエストボディからテキストを取得
    const { text } = await c.req.json()

    // バリデーション：テキストが存在し、文字列型であることを確認
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'テキストが必要です' }, 400)
    }

    // Gemini APIを使用して投稿文をメディアリテラシーの観点から分析
    const analysis = await analyzePost(text, c.env.GOOGLE_API_KEY)

    // 成功レスポンスを返す
    return c.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(), // ISO 8601形式の時刻
    })
  } catch (error) {
    // エラーレスポンスを返す
    return c.json(
      {
        error: '分析に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500 // Internal Server Error
    )
  }
})

export default analyzeRouter
