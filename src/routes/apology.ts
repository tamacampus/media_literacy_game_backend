import { vValidator } from '@hono/valibot-validator'
import { Hono } from 'hono'
import { ERROR_MESSAGES } from '../constants'
import { analyzeApology } from '../services/analyzeApology'
import { AppError } from '../services/errors'
import { saveAnalysisResult } from '../services/saveAnalysisResult'
import type { Env } from '../types/env'
import { createErrorResponse, createSuccessResponse } from '../types/responses'
import { analysisRequestSchema } from '../validators/validation-schemas'

/**
 * 謝罪文分析用のルーター
 * 謝罪文の適切性をメディアリテラシーの観点から評価
 */
const apologyRouter = new Hono<{ Bindings: Env }>()

/**
 * POST /apology
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
apologyRouter.post('/apology', vValidator('json', analysisRequestSchema), async (c) => {
  try {
    // vValidatorで検証済みのデータを取得
    const { text, context, shouldSave } = c.req.valid('json')

    // Gemini APIを使用して謝罪文を分析
    // 謝罪文専用の分析関数を使用して、適切性を評価します
    const analysis = await analyzeApology(text, c.env.GOOGLE_API_KEY, context)

    // shouldSaveがtrueの場合、結果をD1データベースに保存
    if (shouldSave) {
      try {
        await saveAnalysisResult(c.env.DB, 'apology', text, context, analysis)
      } catch (dbError) {
        // DB保存エラーはログに記録するが、ユーザーには分析結果を返す
        console.error('[/apology] Database save error:', dbError)
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
    console.error('[/apology] Unexpected error:', error)
    c.status(500)
    return c.json(createErrorResponse(ERROR_MESSAGES.UNEXPECTED_ERROR, 'INTERNAL_ERROR'))
  }
})

export default apologyRouter
