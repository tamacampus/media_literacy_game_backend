/**
 * 分析結果の型定義
 * Gemini APIから返される分析結果の構造を定義
 */
export interface AnalysisResult {
  /** 分析結果の説明文（50文字以内の簡潔な日本語） */
  explanation: string

  /** リスクレベル（5段階評価） */
  riskLevel: 'very low' | 'low' | 'medium' | 'high' | 'very high'
}
