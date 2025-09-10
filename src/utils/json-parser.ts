/**
 * マークダウンコードブロックを含む可能性のあるテキストからJSONを抽出・解析する
 * プレーンJSONと```jsonラップされたコンテンツの両方に対応
 */
export function extractAndParseJSON(text: string): unknown {
  // マークダウンフォーマットを削除してテキストをクリーンアップ
  const cleanedText = text.trim()

  // まず、プレーンJSONとしてパースを試行
  try {
    return JSON.parse(cleanedText)
  } catch {
    // 失敗した場合、マークダウンコードブロックからJSONを抽出
  }

  // ```jsonまたは```コードブロックを検索
  const codeBlockMatch = cleanedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch (error) {
      console.warn('マークダウンコードブロック内のJSONパースに失敗:', error)
      // 他の抽出方法を続行
    }
  }

  // テキスト内のJSONオブジェクトを探す（最も寛容的）
  // この正規表現は波括弧で囲まれたコンテンツを探す
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      // JSON部分のみを抽出
      const jsonCandidate = jsonMatch[0]
      return JSON.parse(jsonCandidate)
    } catch (error) {
      console.error('JSONオブジェクトのパースに失敗:', error)
      console.error('入力テキスト:', cleanedText)
      throw new Error(`JSONのパースに失敗しました: ${error}`)
    }
  }

  // テキスト内のJSON配列を探す
  const arrayMatch = cleanedText.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch (error) {
      console.error('JSON配列のパースに失敗:', error)
    }
  }

  console.error('有効なJSONが見つかりませんでした。入力:', cleanedText)
  throw new Error('レスポンス内に有効なJSONが見つかりませんでした')
}
