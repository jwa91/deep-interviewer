# Repository Structure

```
deep-interviewer/
├── docs/                          # Documentation
│   ├── agent-runtime-sequence.md  # Mermaid sequence diagram of agent flow
│   ├── api-guide.md               # API reference for frontend integration
│   ├── application-flowchart.md   # System architecture diagram
│   ├── data-flow.md               # Data flow visualization
│   └── repo-structure.md          # This file
│
├── src/
│   ├── agents/                    # LangGraph agent (backend only)
│   │   └── interviewer/
│   │       ├── agent.ts           # Agent graph definition
│   │       ├── config.ts          # Agent configuration
│   │       ├── prompts.ts         # System prompts for Claude
│   │       ├── state.ts           # InterviewState type definition
│   │       ├── tools.ts           # Tool definitions (record_* functions)
│   │       └── tool-factory.ts    # Dynamic tool generation
│   │
│   ├── server/                    # Hono API server (backend only)
│   │   ├── index.ts               # Server entry point
│   │   ├── invites.ts             # Invite code management
│   │   ├── persistence.ts         # SQLite checkpointer setup
│   │   ├── routes/
│   │   │   ├── interview.ts       # /api/interviews/* endpoints
│   │   │   └── admin.ts           # /api/admin/* endpoints
│   │   ├── services/
│   │   │   └── mock-interview.ts  # Debug mode mock service
│   │   └── storage/               # File storage implementations
│   │
│   ├── shared/                    # Isomorphic code (frontend + backend)
│   │   ├── constants.ts           # Shared constants
│   │   ├── schema/
│   │   │   ├── base.ts            # Base Zod schemas
│   │   │   ├── progress.ts        # Progress tracking schemas
│   │   │   └── questions.ts       # Question definitions & schemas
│   │   └── mocks/                 # Test mocks
│   │
│   ├── features/                  # Feature modules (frontend)
│   │   ├── interview/             # Main interview chat UI
│   │   │   ├── chat-container.tsx
│   │   │   ├── hooks/             # useChatStream, useInterviewSession
│   │   │   ├── input/             # Message input components
│   │   │   ├── messages/          # Message display components
│   │   │   └── progress/          # Progress bar & header
│   │   ├── welcome/               # Landing/welcome screen
│   │   ├── completion/            # Interview completion modal
│   │   ├── admin/                 # Admin dashboard
│   │   └── debug/                 # Debug overlay
│   │
│   ├── components/ui/             # shadcn/ui components
│   ├── hooks/                     # Global React hooks
│   ├── lib/                       # Frontend utilities (cn helper)
│   ├── styles/                    # CSS tokens and themes
│   └── test/                      # Test setup & factories
│
├── scripts/
│   └── generate-invite.ts         # CLI tool for invite generation
│
├── public/                        # Static assets
├── .env.example                   # Environment variables template
├── docker-compose.yml             # Docker deployment config
├── Dockerfile                     # Container build config
└── vite.config.ts                 # Vite bundler config
```

## Import Rules

| Module       | Can Import From        |
| ------------ | ---------------------- |
| `shared`     | Nothing (standalone)   |
| `agents`     | `shared`               |
| `server`     | `agents`, `shared`     |
| `features`   | `shared`, `components` |
| `components` | `shared`, `lib`        |

## Key Files

- **Entry points**: `src/main.tsx` (frontend), `src/server/index.ts` (backend)
- **Agent core**: `src/agents/interviewer/agent.ts` - The LangGraph state machine
- **API routes**: `src/server/routes/interview.ts` - REST + SSE endpoints
- **State schema**: `src/agents/interviewer/state.ts` - InterviewState definition
