/**
 * APIレスポンスの型定義
 *
 * すべてのAPIレスポンスで使用される型を定義
 */

import type { AnalysisResult } from '../services/types'

/**
 * 成功レスポンスの基本型
 */
interface SuccessResponse {
  success: true
  timestamp: string
}

/**
 * エラーレスポンスの基本型
 */
interface ErrorResponse {
  error: string
  errorCode: string
  timestamp: string
}

/**
 * 分析成功レスポンス
 */
export interface AnalysisSuccessResponse extends SuccessResponse {
  analysis: AnalysisResult
}

/**
 * 分析エラーレスポンス
 */
export type AnalysisErrorResponse = ErrorResponse

/**
 * ヘルスチェックレスポンス
 */
export interface HealthCheckResponse {
  status: 'ok'
  service: string
  timestamp: string
}

/**
 * バリデーションエラーレスポンス
 */
export interface ValidationErrorResponse extends ErrorResponse {
  error: string
  errorCode: 'VALIDATION_ERROR'
  details?: {
    field: string
    message: string
  }[]
}

/**
 * レスポンスヘルパー関数
 */
export const createSuccessResponse = (analysis: AnalysisResult): AnalysisSuccessResponse => ({
  success: true,
  analysis,
  timestamp: new Date().toISOString(),
})

export const createErrorResponse = (error: string, errorCode: string): ErrorResponse => ({
  error,
  errorCode,
  timestamp: new Date().toISOString(),
})

/**
 * AppErrorからエラーレスポンスを生成（details付き）
 */
export const createErrorResponseFromAppError = (appError: {
  userMessage: string
  errorCode: string
  details?: { field: string; message: string }[]
}): ErrorResponse | ValidationErrorResponse => {
  const baseResponse = {
    error: appError.userMessage,
    errorCode: appError.errorCode,
    timestamp: new Date().toISOString(),
  }

  if (appError.details && appError.errorCode === 'VALIDATION_ERROR') {
    return {
      ...baseResponse,
      errorCode: 'VALIDATION_ERROR' as const,
      details: appError.details,
    }
  }

  return baseResponse
}

export const createValidationErrorResponse = (
  message: string,
  details?: { field: string; message: string }[]
): ValidationErrorResponse => ({
  error: message,
  errorCode: 'VALIDATION_ERROR',
  timestamp: new Date().toISOString(),
  details,
})
