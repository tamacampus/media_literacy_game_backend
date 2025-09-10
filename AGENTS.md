# AGENTS.md

This file provides guidance to AI Coding Agents when working with code in this repository.

## Project Overview

Media Literacy Game Backend - A Cloudflare Workers API server that analyzes text from a media literacy perspective using Google Gemini AI.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run type checking
bun run check

# Format code
bun run format
```

## Architecture

### Technology Stack
- **Runtime**: Cloudflare Workers (via Wrangler)
- **Framework**: Hono v4.9.6 (lightweight web framework)
- **AI Service**: Google Gemini API (gemini-2.5-flash model)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **Code Formatter**: Biome

### Project Structure

```
src/
├── index.ts                  # Main entry point, middleware setup, error handling
├── routes/
│   ├── analyze.ts           # POST /analyze - SNS post analysis endpoint
│   ├── apology.ts           # POST /apology - Apology text analysis endpoint
│   ├── health.ts            # GET / - Health check endpoint
│   └── mock.ts              # POST /mock - Mock endpoint for testing
├── services/
│   ├── analyzePost.ts       # Post analysis business logic
│   ├── analyzeApology.ts    # Apology analysis business logic
│   ├── geminiClient.ts      # Shared Gemini API client with structured output
│   └── types.ts             # AnalysisResult type definition
└── types/
    └── env.ts               # CloudflareBindings interface
```

## Key Files and Their Responsibilities

### `src/index.ts`
- Hono app initialization with CloudflareBindings
- CORS and logger middleware configuration
- Global error handling (500 errors)
- 404 handler
- Cloudflare Workers fetch handler export

### `src/services/geminiClient.ts`
- **Function**: `callGeminiAPI(prompt, apiKey, errorMessage)`
- Uses structured output with JSON Schema
- Returns `AnalysisResult` type
- Enforces response format with required fields

### `src/services/analyzePost.ts`
- **Function**: `analyzePost(text, apiKey)`
- Analyzes SNS posts for media literacy risks
- Intentionally harsh evaluation criteria
- 50-character limit on explanations
- Simple Japanese output for elementary school level

### `src/services/analyzeApology.ts`
- **Function**: `analyzeApology(text, apiKey)`
- Evaluates corporate/public apology appropriateness
- Checks for sincerity, responsibility, and concrete improvements
- Same output constraints as post analysis

## API Endpoints

### GET `/`
Returns health status

### POST `/analyze`
```json
Request:  { "text": "string" }
Response: { "explanation": "string", "riskLevel": "very low|low|medium|high|very high" }
```

### POST `/apology`
```json
Request:  { "text": "string" }
Response: { "explanation": "string", "riskLevel": "very low|low|medium|high|very high" }
```

### POST `/mock`
Returns fixed mock response for testing

## Environment Setup

### Development (.dev.vars file)
```
GOOGLE_API_KEY=your_api_key_here
```

### Production (Cloudflare Secrets)
```bash
wrangler secret put GOOGLE_API_KEY
```

## Important Implementation Details

### Gemini API Configuration
- Model: `gemini-2.5-flash` (optimized for speed)
- Response format: JSON with enforced schema
- Schema validation for type safety
- Error messages are intentionally generic for security

### Response Constraints
- Explanation: Max 50 Japanese characters
- Language level: Elementary school Japanese
- Evaluation style: Intentionally critical/harsh
- Risk levels: 5-tier system (very low to very high)

### Error Handling Pattern
- All endpoints use try-catch blocks
- Errors return Japanese messages with 4xx/5xx codes
- Detailed error info only in development
- Generic error messages in production

### Middleware Chain
1. CORS (allows all origins - development setting)
2. Logger (request/response logging)
3. Route handlers
4. Global error handler
5. 404 handler

## Development Workflow

### Type Safety
- TypeScript strict mode enabled
- CloudflareBindings interface for env vars
- AnalysisResult type for API responses
- No implicit any allowed

### Code Quality
- Biome for formatting and linting
- JSDoc comments for functions
- Consistent error handling patterns
- Separation of concerns (routes/services)

## Deployment

### Cloudflare Workers
```bash
# Deploy to production
bun run deploy

# Generate CF types
bun run cf-typegen
```

### Configuration Files
- `wrangler.toml`: Cloudflare Workers configuration
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and scripts
- `.dev.vars`: Local development secrets

## Testing

### Simple Client
- Location: `simple-client/index.html`
- Purpose: Manual API testing interface
- Features: Form inputs for both analysis endpoints

### cURL Examples
```bash
# Health check
curl http://localhost:8787/

# Analyze post
curl -X POST http://localhost:8787/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}'
```

## Common Tasks

### Adding a New Endpoint
1. Create route file in `src/routes/`
2. Add business logic in `src/services/`
3. Import and register in `src/index.ts`
4. Update types if needed

### Modifying Gemini Prompts
- Edit prompt strings in `analyzePost.ts` or `analyzeApology.ts`
- Keep evaluation criteria section
- Maintain output constraints

### Updating Response Schema
- Modify schema in `geminiClient.ts`
- Update `AnalysisResult` type in `types.ts`
- Ensure backward compatibility

## Troubleshooting

### Common Issues
1. **GOOGLE_API_KEY not found**: Check `.dev.vars` file exists
2. **Gemini API errors**: Verify API key and quota
3. **Type errors**: Run `bun run check`
4. **CORS issues**: Check middleware configuration

### Debug Mode
- Wrangler dev server includes detailed logging
- Check browser console for client-side errors
- Use `wrangler tail` for production logs

## Security Considerations

### Current Implementation
- API keys stored as secrets
- Generic error messages to users
- Input validation (empty string check)
- CORS enabled for all origins (dev mode)

### Production Recommendations
- Restrict CORS to specific domains
- Add rate limiting via Cloudflare
- Implement request authentication
- Add input sanitization
- Enable Cloudflare DDoS protection

## Notes for Claude Code

### When modifying this project:
1. Always maintain TypeScript strict mode
2. Keep Japanese output at elementary level
3. Preserve the harsh evaluation style
4. Respect 50-character limit on explanations
5. Test with both endpoints after changes
6. Update this documentation when adding features

### Code style preferences:
- Use async/await over raw promises
- Prefer const over let
- Use template literals for multi-line strings
- Keep functions small and focused
- Document complex logic with JSDoc

### Testing approach:
- Use the simple-client for manual testing
- Test edge cases (empty strings, long texts)
- Verify error handling paths
- Check Japanese output readability