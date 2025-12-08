# Deep Interviewer

An AI-powered conversational interview agent that collects course feedback through natural dialogue instead of boring survey forms.

## Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Working |
| Frontend | ⏳ Not connected |
| Docker | ⏳ Not tested |

## Overview

Built with LangChain's LangGraph, this agent conducts interviews in Dutch, naturally weaving in 9 feedback questions while maintaining a friendly, conversational tone. Instead of rigid forms, participants chat with an AI that adapts to their responses and goes deeper when interesting insights emerge.

## Project Structure

```
src/
├── shared/schema/       # Zod schemas for all 9 interview questions
├── agents/interviewer/  # LangGraph agent, tools, prompts, state
└── server/              # Hono API with SSE streaming
```

## API Endpoints

- `POST /api/interviews` - Create new interview session
- `GET /api/interviews/:id` - Get interview state and progress
- `POST /api/interviews/:id/chat` - Send message (SSE streaming)
- `GET /api/interviews/:id/results` - Get completed interview results

## Tech Stack

- **Agent**: LangGraph + Anthropic Claude
- **Server**: Hono (Node.js)
- **Persistence**: SQLite (via LangGraph checkpointer)
- **Streaming**: Server-Sent Events (SSE)

## Quick Start

```bash
# Set up environment
cp .env.example .env  # Add your ANTHROPIC_API_KEY

# Install and run
pnpm install
pnpm dev:server
```

## The 9 Interview Questions

1. AI background (experience before training)
2. Overall impression
3. Perceived content (what they think it was about)
4. Difficulty & pace
5. Content quality & relevance
6. Presentation quality
7. Clarity of explanations
8. Suggestions & recommendations
9. Course parts comparison (theory vs practical)

Each question captures both quantitative ratings (for comparison) and qualitative insights (summaries + quotes).
