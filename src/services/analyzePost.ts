/**
 * 投稿文分析サービス
 *
 * Google Gemini AIを使用してSNS投稿文をメディアリテラシーの観点から分析
 */

import { callGeminiAPI } from './geminiClient'
import type { AnalysisResult } from './types'

/**
 * 投稿文をメディアリテラシーの観点から分析する関数
 *
 * @param text - 分析対象の投稿文
 * @param apiKey - Google Gemini APIキー
 * @returns 分析結果（説明文とリスクレベル）
 * @throws Error - Gemini API呼び出しに失敗した場合
 */
export async function analyzePost(text: string, apiKey: string): Promise<AnalysisResult> {
  /**
   * プロンプトの構築（投稿文用）
   * Geminiに送信する指示文を作成
   *
   * 重要なポイント：
   * - 50文字以内の簡潔な説明
   * - 辛口で厳しめの評価
   */
  const prompt = `
以下の投稿文を分析して、メディアリテラシーの観点からリスクを評価してください。
注意事項：ここに記載されている内容をそのまま出力しないでください。返答は1文の日本語でお願いします。
絶対に短く出力してください。50文字以内でお願いします。

評価基準：
- 情報の正確性・信頼性
- 偏見や差別的な表現の有無
- 個人情報やプライバシーへの配慮
- 誤解を招く表現や煽動的な言葉遣い
- フェイクニュースや誤情報の可能性

投稿文: "${text}"

メディアリテラシーの分析では幅広い要素を考慮してください。
なお、評価は非常に辛口で難癖をつける感じでお願いします。
リスクレベルは高めに評価してください。
explanationには、リスクレベルの判断理由と具体的なリスク要因を含めて説明してください。
注意事項：この文章の内容はユーザーには見えないため、ここに記載されている内容をそのまま出力しないでください。返答は1文の日本語でお願いします。
絶対に短く出力してください。3行程度でお願いします。
`

  // 共通関数を使用してGemini APIを呼び出す
  return callGeminiAPI(prompt, apiKey)
}

/**
 * 後方互換性のための別名エクスポート
 * @deprecated analyzePost を使用してください
 */
export const analyzeMediaLiteracy = analyzePost
