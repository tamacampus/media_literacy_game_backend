import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Analysis results table
 * Stores all analysis results from both /analyze and /apology endpoints
 */
export const analysisResults = sqliteTable('analysis_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  endpointType: text('endpoint_type', { enum: ['analyze', 'apology'] }).notNull(),
  inputText: text('input_text').notNull(),
  context: text('context'),
  explanation: text('explanation').notNull(),
  riskLevel: text('risk_level', {
    enum: ['very low', 'low', 'medium', 'high', 'very high'],
  }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type AnalysisResultRow = typeof analysisResults.$inferSelect
export type NewAnalysisResult = typeof analysisResults.$inferInsert
