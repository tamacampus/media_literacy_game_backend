/**
 * アプリケーション定数
 *
 * プロジェクト全体で使用される定数を定義
 */

/**
 * サービス情報
 */
export const SERVICE_INFO = {
  NAME: 'Media Literacy Game API',
  VERSION: '1.0.0',
  DESCRIPTION: 'メディアリテラシー分析API',
} as const

/**
 * 分析設定
 */
export const ANALYSIS_CONFIG = {
  MAX_TEXT_LENGTH: 5000,
  MIN_TEXT_LENGTH: 1,
  MAX_EXPLANATION_LENGTH: 50,
  GEMINI_MODEL: 'gemini-2.5-flash',
} as const

/**
 * エラーコード
 */
export const ERROR_CODES = {
  // クライアントエラー (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_AUTH_ERROR: 'API_AUTH_ERROR',
  CONTENT_FILTER_ERROR: 'CONTENT_FILTER_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  QUOTA_EXCEEDED_ERROR: 'QUOTA_EXCEEDED_ERROR',

  // サーバーエラー (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  API_RESPONSE_ERROR: 'API_RESPONSE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

/**
 * エラーメッセージ（日本語）
 */
export const ERROR_MESSAGES = {
  TEXT_REQUIRED: 'テキストが必要です',
  TEXT_TOO_LONG: `テキストが長すぎます（最大${ANALYSIS_CONFIG.MAX_TEXT_LENGTH}文字）`,
  TEXT_TOO_SHORT: 'テキストが短すぎます（最低1文字必要）',
  INVALID_TEXT_TYPE: 'テキストは文字列である必要があります',
  UNEXPECTED_ERROR: '予期しないエラーが発生しました',
  SERVER_ERROR: 'サーバーエラーが発生しました',
} as const

/**
 * リスクレベル
 */
export const RISK_LEVELS = {
  VERY_LOW: 'very low',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very high',
} as const

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS]

/**
 * HTTPステータスコード
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const
