/**
 * Cloudflare Workers環境変数の型定義
 */
export interface Env {
  /**
   * Google Gemini APIキー
   */
  GOOGLE_API_KEY: string
  /**
   * D1 Database binding for storing analysis results
   */
  DB: D1Database
}
