/**
 * Gemini API共通クライアント
 *
 * Google Gemini APIへのリクエストを処理する共通関数
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { ANALYSIS_CONFIG } from '../constants'
import { extractAndParseJSON } from '../utils/json-parser'
import { classifyGeminiError, NetworkError } from './errors'
import type { AnalysisResult } from './types'

/**
 * リトライ設定
 */
const RETRY_CONFIG = {
  MAX_RETRIES: 3, // 最大リトライ回数（初回を含む）
  RETRY_DELAY_MS: 2000, // リトライ間隔（ミリ秒）
}

/**
 * 指定したミリ秒間待機する
 * @param ms - 待機時間（ミリ秒）
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Gemini APIを呼び出して分析を実行する共通関数
 * ネットワークエラー時は2秒間隔で最大3回リトライする
 *
 * @param prompt - 分析用のプロンプト
 * @param apiKey - Google Gemini APIキー
 * @returns 分析結果（説明文とリスクレベル）
 * @throws AppError - Gemini API呼び出しに失敗した場合
 */
export async function callGeminiAPI(prompt: string, apiKey: string): Promise<AnalysisResult> {
  /**
   * Google Generative AIクライアントの初期化
   */
  const genAI = new GoogleGenerativeAI(apiKey)

  /**
   * Geminiモデルの設定
   * - model: 使用するモデル（2.5-flash は高速版）
   * - generationConfig: 出力形式の設定
   */
  const model = genAI.getGenerativeModel({
    model: ANALYSIS_CONFIG.GEMINI_MODEL,
    generationConfig: {
      // JSON形式でレスポンスを取得
      responseMimeType: 'application/json',
      // レスポンスのスキーマ定義（型安全性を確保）
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          // 説明文のスキーマ
          explanation: {
            type: SchemaType.STRING,
            description: '分析結果の説明文',
          },
          // リスクレベルのスキーマ
          riskLevel: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['very low', 'low', 'medium', 'high', 'very high'],
            description: 'リスクレベル（5段階評価）',
          },
        },
        // 必須フィールドの指定
        required: ['explanation', 'riskLevel'],
      },
    },
  })

  // リトライループ：最大3回試行
  let lastError: Error | unknown
  for (let attempt = 1; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      // Gemini APIを呼び出してコンテンツを生成
      const result = await model.generateContent(prompt)

      // レスポンスを取得
      const response = result.response

      // テキスト形式でレスポンスを取得
      const responseText = response.text()

      // JSON文字列をパースして型付きオブジェクトとして返す
      const parsedResult = extractAndParseJSON(responseText) as AnalysisResult

      // レスポンスの検証
      if (!parsedResult.explanation || !parsedResult.riskLevel) {
        throw new Error('Invalid response format from Gemini API')
      }

      return parsedResult
    } catch (error) {
      lastError = error

      // エラーを分類
      const classifiedError = classifyGeminiError(error)

      // ネットワークエラーの場合のみリトライを試みる
      if (classifiedError instanceof NetworkError && attempt < RETRY_CONFIG.MAX_RETRIES) {
        console.log(`Network error detected. Retrying... (${attempt}/${RETRY_CONFIG.MAX_RETRIES})`)
        await sleep(RETRY_CONFIG.RETRY_DELAY_MS)
        continue
      }

      // ネットワークエラー以外、または最終試行の場合はエラーをthrow
      throw classifiedError
    }
  }

  // ここには到達しないはずだが、型安全性のため
  throw classifyGeminiError(lastError)
}
