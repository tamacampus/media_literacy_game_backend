/**
 * Hono vValidatorで使用するValibotスキーマ定義
 *
 * シンプルで再利用可能なバリデーションスキーマ
 */

import * as v from 'valibot'
import { ANALYSIS_CONFIG, ERROR_MESSAGES } from '../constants'

/**
 * 分析リクエストの基本スキーマ
 * 投稿文と謝罪文の両方で使用
 */
export const analysisRequestSchema = v.object({
  text: v.pipe(
    v.string(ERROR_MESSAGES.INVALID_TEXT_TYPE),
    v.nonEmpty(ERROR_MESSAGES.TEXT_REQUIRED),
    v.minLength(ANALYSIS_CONFIG.MIN_TEXT_LENGTH, ERROR_MESSAGES.TEXT_TOO_SHORT),
    v.maxLength(ANALYSIS_CONFIG.MAX_TEXT_LENGTH, ERROR_MESSAGES.TEXT_TOO_LONG),
    v.transform((val) => val.trim()) // 前後の空白を自動除去
  ),
  context: v.optional(
    v.pipe(
      v.string('文脈は文字列である必要があります'),
      v.maxLength(1000, '文脈は1000文字以内で入力してください'),
      v.transform((val) => val.trim()) // 前後の空白を自動除去
    )
  ),
})

/**
 * 分析リクエストの型定義（推論）
 */
export type AnalysisRequest = v.InferOutput<typeof analysisRequestSchema>
