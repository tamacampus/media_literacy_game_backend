import { Hono } from 'hono'
import type { AnalysisResult } from '../services/types'

/**
 * モック用のルーター
 * 開発・テスト時にGemini APIを使わずに動作確認するためのエンドポイント
 */
const mockRouter = new Hono()

/**
 * POST /mock
 * テスト用のモックエンドポイント
 *
 * Gemini APIを実際に呼び出さず、固定のレスポンスを返します。
 * これにより、以下のような場合に便利です：
 * - APIキーがまだ取得できていない場合
 * - API制限を避けたい場合
 * - フロントエンドの開発・テスト時
 *
 * @param {Object} body - リクエストボディ
 * @param {string} body.text - 分析対象のテキスト（実際には使用されない）
 *
 * @returns {Object} - モック分析結果
 * - success: true - 常に成功
 * - analysis: 固定の分析結果
 *   - explanation: 'Mock analysis result'
 *   - riskLevel: 'medium'
 * - timestamp: レスポンス生成時刻（ISO形式）
 *
 * @throws {400} テキストが空または不正な場合
 * @throws {500} 予期せぬエラーが発生した場合
 */
mockRouter.post('/mock', async (c) => {
  try {
    // リクエストボディからテキストを取得（実際には使用しない）
    const { text } = await c.req.json()

    // バリデーション：テキストが存在し、文字列型であることを確認
    // モックでもバリデーションは実施する
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'テキストが必要です' }, 400)
    }

    // 固定のモックレスポンスを返す
    // 実際のAPIと同じ形式のデータ構造
    return c.json({
      success: true,
      analysis: {
        explanation: 'Mock analysis result',
        riskLevel: 'medium',
      } as AnalysisResult,
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

export default mockRouter
