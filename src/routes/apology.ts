import { Hono } from 'hono'
import { analyzeApology } from '../services/analyzeApology'
import type { Env } from '../types/env'

/**
 * 謝罪文分析用のルーター
 * 謝罪文の適切性をメディアリテラシーの観点から評価
 */
const apologyRouter = new Hono<{ Bindings: Env }>()

/**
 * POST /analyze-apology
 * 謝罪文をメディアリテラシーの観点から分析するエンドポイント
 *
 * このエンドポイントは、企業や個人の謝罪文が
 * 適切に構成されているか、誠意が伝わるかを評価します
 *
 * @param {Object} body - リクエストボディ
 * @param {string} body.text - 分析対象の謝罪文
 *
 * @returns {Object} - 分析結果
 * - success: true/false - 処理の成功/失敗
 * - analysis: 分析結果オブジェクト
 *   - explanation: 謝罪文の評価と改善点
 *   - riskLevel: 不適切さのレベル（5段階）
 * - timestamp: レスポンス生成時刻（ISO形式）
 *
 * @throws {400} テキストが空または不正な場合
 * @throws {500} 分析処理でエラーが発生した場合
 */
apologyRouter.post('/analyze-apology', async (c) => {
  try {
    // リクエストボディから謝罪文を取得
    const { text } = await c.req.json()

    // バリデーション：謝罪文が存在し、文字列型であることを確認
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'テキストが必要です' }, 400)
    }

    // Gemini APIを使用して謝罪文を分析
    // 謝罪文専用の分析関数を使用して、適切性を評価します
    const analysis = await analyzeApology(text, c.env.GOOGLE_API_KEY)

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
        error: '謝罪文分析に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500 // Internal Server Error
    )
  }
})

export default apologyRouter
