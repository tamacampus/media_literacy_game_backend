/**
 * Gemini API共通クライアント
 *
 * Google Gemini APIへのリクエストを処理する共通関数
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { AnalysisResult } from './types'

/**
 * Gemini APIを呼び出して分析を実行する共通関数
 *
 * @param prompt - 分析用のプロンプト
 * @param apiKey - Google Gemini APIキー
 * @param errorMessage - エラー時のメッセージ
 * @returns 分析結果（説明文とリスクレベル）
 * @throws Error - Gemini API呼び出しに失敗した場合
 */
export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  errorMessage: string = 'Failed to analyze'
): Promise<AnalysisResult> {
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
    model: 'gemini-2.5-flash',
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

  try {
    // Gemini APIを呼び出してコンテンツを生成
    const result = await model.generateContent(prompt)

    // レスポンスを取得
    const response = result.response

    // テキスト形式でレスポンスを取得
    const responseText = response.text()

    // JSON文字列をパースして型付きオブジェクトとして返す
    return JSON.parse(responseText) as AnalysisResult
  } catch (_error) {
    // エラーを上位に伝播
    throw new Error(errorMessage)
  }
}