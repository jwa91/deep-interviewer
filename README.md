# Deep Interviewer

An AI-powered conversational interview agent that collects course feedback through natural dialogue instead of boring survey forms.

## Overview

Small LangGraph experiment. I needed to do a survey for a course i gave. This agent conducts interviews in Dutch, naturally weaving in 6 feedback questions. Instead of rigid forms, participants chat with an AI that adapts to their responses and goes deeper when interesting insights emerge.
The agent can also share the slides with a slide share tool.

## Project Structure

```
src/
├── agents/           # LangGraph agent (prompts, tools, state) - backend only
├── server/           # Hono API server (routes, persistence) - backend only
├── shared/           # Isomorphic code (schemas, constants, mocks)
├── features/         # Feature modules (interview UI)
├── components/ui/    # shadcn/ui components
├── lib/              # Frontend utilities (cn helper)
└── styles/           # CSS tokens and themes
```

**Import rules:** `shared` → nothing | `agents` → `shared` | `server` → `agents`, `shared` | `features` → `shared`, `components`

## API Endpoints

- `POST /api/interviews` - Create new interview session
- `GET /api/interviews/:id` - Get interview state and progress
- `POST /api/interviews/:id/chat` - Send message (SSE streaming)
- `GET /api/interviews/:id/results` - Get completed interview results

## Documentation

- [Repository Structure](docs/repo-structure.md) - Project layout and import rules
- [API Guide](docs/api-guide.md) - REST & SSE endpoint reference for frontend integration
- [Application Flowchart](docs/application-flowchart.md) - System architecture diagram
- [Agent Runtime Sequence](docs/agent-runtime-sequence.md) - Detailed sequence diagram of agent flow
- [Data Flow](docs/data-flow.md) - High-level data flow visualization

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

## The 6 Interview Questions

1. AI background (experience before training + expectations)
2. Overall impression (value, recommendation, confidence lift)
3. Difficulty & pace (tempo, cognitive load)
4. Content quality & relevance (depth, usefulness)
5. Presentation (delivery, clarity, engagement)
6. Suggestions & recommendations (improvements)

Each question captures both quantitative ratings (for comparison) and qualitative insights (summaries + quotes).
