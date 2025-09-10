/**
 * Valibotバリデーションスキーマ定義
 *
 * APIリクエストの入力値検証に使用するスキーマを定義
 */

import * as v from 'valibot'
import { ANALYSIS_CONFIG, ERROR_MESSAGES } from '../constants'

/**
 * 分析リクエストのスキーマ
 * 投稿文と謝罪文の両方で使用
 */
export const AnalysisRequestSchema = v.object({
  text: v.pipe(
    v.string(ERROR_MESSAGES.INVALID_TEXT_TYPE),
    v.nonEmpty(ERROR_MESSAGES.TEXT_REQUIRED),
    v.minLength(ANALYSIS_CONFIG.MIN_TEXT_LENGTH, ERROR_MESSAGES.TEXT_TOO_SHORT),
    v.maxLength(ANALYSIS_CONFIG.MAX_TEXT_LENGTH, ERROR_MESSAGES.TEXT_TOO_LONG),
    v.transform((val) => val.trim()) // 前後の空白を除去
  ),
})

/**
 * 分析リクエストの型
 */
export type AnalysisRequest = v.InferOutput<typeof AnalysisRequestSchema>

/**
 * バリデーションエラーをユーザーフレンドリーな形式に変換
 */
export function formatValidationErrors(
  issues: v.BaseIssue<unknown>[]
): Array<{ field: string; message: string }> {
  return issues.map((issue) => ({
    field: issue.path?.map((p) => String(p.key)).join('.') || 'unknown',
    message: issue.message,
  }))
}
