# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tyrano Media Literacy project - an API server that evaluates text from a media literacy perspective. The system integrates Google's Gemini AI for text analysis.

## Development Commands

### Core Commands
- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run build` - Build the project (outputs to dist/)
- `bun install` - Install dependencies


## Architecture

### Core Structure
- **Runtime**: Bun with TypeScript
- **Framework**: Hono (web framework)
- **AI Services**: Google Gemini API
- **Entry Point**: `src/index.ts`

### Service Layer (`src/services/`)
- **`gemini.ts`**: Handles text analysis using Gemini API with structured output schema
  - Exports `analyzeMediaLiteracy(text: string): Promise<AnalysisResult>`
  - Returns structured data: explanation and riskLevel

### API Endpoints
- `GET /` - Health check
- `POST /analyze` - Analyze post text from media literacy perspective
- `POST /analyze-apology` - Analyze apology text from media literacy perspective
- `POST /mock` - Mock endpoint for testing

### Client Application
- **Location**: `simple-client/` directory
- **Type**: Vanilla HTML/CSS/JS web client
- **Purpose**: Frontend for testing the API

## Environment Configuration

Required environment variables (see `.env.example`):
- `GOOGLE_API_KEY` - Gemini API key
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

## Key Technical Details

### Gemini Integration
- Uses `gemini-2.5-flash` model with structured output
- Schema enforces JSON response format with required fields
- Analyzes text from a media literacy perspective

### Error Handling
- Comprehensive try-catch blocks in all endpoints
- Structured error responses with details

## Japanese Language Support
- Full Japanese text processing
- Japanese error messages and API responses