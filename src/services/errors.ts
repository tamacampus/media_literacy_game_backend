/**
 * カスタムエラークラス定義
 *
 * アプリケーション内で発生する様々なエラーを分類して管理
 */

import type * as v from 'valibot'
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from '../constants'
import { formatValidationErrors } from '../validators/schemas'

/**
 * HTTPステータスコードの型定義
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

/**
 * APIエラーの基底クラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: HttpStatusCode,
    public readonly errorCode: string,
    public readonly userMessage: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * バリデーションエラー
 * 入力値の検証に失敗した場合
 */
export class ValidationError extends AppError {
  constructor(
    message?: string,
    public readonly details?: { field: string; message: string }[]
  ) {
    super(
      message || 'Validation failed',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      message || ERROR_MESSAGES.TEXT_REQUIRED
    )
  }
}

/**
 * API認証エラー
 * Google APIキーが無効または未設定の場合
 */
export class ApiAuthError extends AppError {
  constructor(message?: string) {
    super(
      message || 'API authentication failed',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.API_AUTH_ERROR,
      'APIキーの認証に失敗しました。設定を確認してください。'
    )
  }
}

/**
 * APIレート制限エラー
 * API呼び出し回数が制限を超えた場合
 */
export class RateLimitError extends AppError {
  constructor(message?: string) {
    super(
      message || 'API rate limit exceeded',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_ERROR,
      'APIの呼び出し制限に達しました。しばらく待ってから再度お試しください。'
    )
  }
}

/**
 * API応答エラー
 * APIから期待した形式のレスポンスが返らなかった場合
 */
export class ApiResponseError extends AppError {
  constructor(message?: string) {
    super(
      message || 'Invalid API response',
      HTTP_STATUS.BAD_GATEWAY,
      ERROR_CODES.API_RESPONSE_ERROR,
      'APIからの応答が正しく処理できませんでした。'
    )
  }
}

/**
 * ネットワークエラー
 * ネットワーク接続の問題でAPIに到達できない場合
 */
export class NetworkError extends AppError {
  constructor(message?: string) {
    super(
      message || 'Network connection failed',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.NETWORK_ERROR,
      'ネットワーク接続に問題が発生しました。接続を確認してください。'
    )
  }
}

/**
 * コンテンツフィルタエラー
 * 分析対象のコンテンツが不適切と判断された場合
 */
export class ContentFilterError extends AppError {
  constructor(message?: string) {
    super(
      message || 'Content was filtered',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.CONTENT_FILTER_ERROR,
      '分析対象のコンテンツが不適切と判断されました。'
    )
  }
}

/**
 * APIクォータエラー
 * APIの日次または月次制限に達した場合
 */
export class QuotaExceededError extends AppError {
  constructor(message?: string) {
    super(
      message || 'API quota exceeded',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.QUOTA_EXCEEDED_ERROR,
      'APIの利用制限に達しました。管理者にお問い合わせください。'
    )
  }
}

/**
 * サービス利用不可エラー
 * Gemini APIサービス自体が利用できない場合
 */
export class ServiceUnavailableError extends AppError {
  constructor(message?: string) {
    super(
      message || 'Service temporarily unavailable',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      'サービスが一時的に利用できません。しばらく待ってから再度お試しください。'
    )
  }
}

/**
 * Gemini APIのエラーレスポンスから適切なカスタムエラーを判定
 *
 * @param error - キャッチしたエラーオブジェクト
 * @returns 適切なカスタムエラーインスタンス
 */
export function classifyGeminiError(error: unknown): AppError {
  // エラーメッセージを取得
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  // エラーメッセージのパターンマッチング
  if (
    errorMessage.includes('api key') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('403')
  ) {
    return new ApiAuthError()
  }

  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('429') ||
    errorMessage.includes('quota')
  ) {
    // クォータとレート制限を区別
    if (errorMessage.includes('daily') || errorMessage.includes('monthly')) {
      return new QuotaExceededError()
    }
    return new RateLimitError()
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout')
  ) {
    return new NetworkError()
  }

  if (
    errorMessage.includes('filter') ||
    errorMessage.includes('blocked') ||
    errorMessage.includes('safety')
  ) {
    return new ContentFilterError()
  }

  if (errorMessage.includes('503') || errorMessage.includes('service unavailable')) {
    return new ServiceUnavailableError()
  }

  if (
    errorMessage.includes('parse') ||
    errorMessage.includes('json') ||
    errorMessage.includes('schema')
  ) {
    return new ApiResponseError()
  }

  // デフォルトは一般的なAPIレスポンスエラー
  return new ApiResponseError(ERROR_MESSAGES.UNEXPECTED_ERROR)
}

/**
 * Valibotバリデーションエラーから適切なカスタムエラーを生成
 *
 * @param issues - Valibotのバリデーションエラーの問題リスト
 * @returns ValidationErrorインスタンス
 */
export function createValidationErrorFromValibot(issues: v.BaseIssue<unknown>[]): ValidationError {
  const details = formatValidationErrors(issues)
  const firstError = issues[0]
  const message = firstError?.message || ERROR_MESSAGES.TEXT_REQUIRED

  return new ValidationError(message, details)
}
