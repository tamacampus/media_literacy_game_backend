import { vValidator } from '@hono/valibot-validator'
import { Hono } from 'hono'
import { ERROR_MESSAGES } from '../constants'
import { analyzePost } from '../services/analyzePost'
import { AppError } from '../services/errors'
import { saveAnalysisResult } from '../services/saveAnalysisResult'
import type { Env } from '../types/env'
import { createErrorResponse, createSuccessResponse } from '../types/responses'
import { analysisRequestSchema } from '../validators/validation-schemas'

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
analyzeRouter.post('/analyze', vValidator('json', analysisRequestSchema), async (c) => {
  try {
    // vValidatorで検証済みのデータを取得
    const { text, context, shouldSave } = c.req.valid('json')

    // Gemini APIを使用して投稿文をメディアリテラシーの観点から分析
    const analysis = await analyzePost(text, c.env.GOOGLE_API_KEY, context)

    // shouldSaveがtrueの場合、結果をD1データベースに保存
    if (shouldSave) {
      try {
        await saveAnalysisResult(c.env.DB, 'analyze', text, context, analysis)
      } catch (dbError) {
        // DB保存エラーはログに記録するが、ユーザーには分析結果を返す
        console.error('[/analyze] Database save error:', dbError)
      }
    }

    // 成功レスポンスを返す
    return c.json(createSuccessResponse(analysis))
  } catch (error) {
    // カスタムエラーの場合は詳細なエラー情報を返す
    if (error instanceof AppError) {
      c.status(error.statusCode)
      return c.json(createErrorResponse(error.userMessage, error.errorCode))
    }

    // 予期しないエラーの場合
    console.error('[/analyze] Unexpected error:', error)
    c.status(500)
    return c.json(createErrorResponse(ERROR_MESSAGES.UNEXPECTED_ERROR, 'INTERNAL_ERROR'))
  }
})

export default analyzeRouter
