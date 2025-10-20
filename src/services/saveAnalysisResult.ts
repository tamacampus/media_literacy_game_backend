import { drizzle } from 'drizzle-orm/d1'
import { analysisResults } from '../db/schema'
import type { AnalysisResult } from './types'

/**
 * Save analysis result to D1 database
 * @param db - D1 database instance from Cloudflare Workers
 * @param endpointType - Type of endpoint ('analyze' or 'apology')
 * @param inputText - Original input text
 * @param context - Optional context information
 * @param result - Analysis result from Gemini API
 */
export async function saveAnalysisResult(
  db: D1Database,
  endpointType: 'analyze' | 'apology',
  inputText: string,
  context: string | undefined,
  result: AnalysisResult
): Promise<void> {
  const drizzleDb = drizzle(db)

  await drizzleDb.insert(analysisResults).values({
    endpointType,
    inputText,
    context: context || null,
    explanation: result.explanation,
    riskLevel: result.riskLevel,
  })
}
