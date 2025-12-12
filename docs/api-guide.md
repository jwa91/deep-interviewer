# Interview API Guide for Frontend

## Overview

The backend exposes a streaming chat API using Server-Sent Events (SSE). The frontend should create interview sessions and then stream chat messages.

## Flow

1. **Create a session** → `POST /api/interviews`
2. **Send messages** → `POST /api/interviews/:id/chat` (returns SSE stream)
3. **Check progress** → `GET /api/interviews/:id`
4. **View/edit responses** → `GET/PUT /api/interviews/:id/responses`
5. **Get results** → `GET /api/interviews/:id/results` (when complete)

---

## Creating a Session

```
POST /api/interviews
Content-Type: application/json
Body: { "code": "invite-code-here" }
```

Requires a valid invite code. Returns:

```json
{
  "id": "uuid",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "message": "Interview session created...",
  "isResumed": false
}
```

- `isResumed: true` means the user is resuming an existing session tied to this invite code
- Store the `id` for subsequent requests

---

## Sending a Message (SSE Stream)

```
POST /api/interviews/:id/chat
Content-Type: application/json
Body: { "message": "user's message here" }
```

Returns an SSE stream with the following event types:

### Event Types

| Event           | Description                 | Data                                                                 |
| --------------- | --------------------------- | -------------------------------------------------------------------- |
| `message_start` | New message segment begins  | `{ messageId: "msg_..." }`                                           |
| `token`         | Streaming text chunk        | `{ content: "...", messageId: "msg_..." }`                           |
| `message_end`   | Message segment complete    | `{ messageId: "msg_..." }`                                           |
| `tool_start`    | Agent is recording feedback | `{ name: "record_...", input: {...} }`                               |
| `tool_end`      | Feedback recorded           | `{ name: "record_...", output: "✓ ..." }`                            |
| `progress`      | Updated completion status   | `{ questionsCompleted, isComplete, completedCount, totalQuestions }` |
| `done`          | Stream finished             | `{ fullResponse, toolCalls, progress }`                              |
| `error`         | Something went wrong        | `{ error: "..." }`                                                   |

### Handling the Stream

1. **Track `message_start`/`message_end`** to handle message boundaries (tool calls split messages)
2. **Accumulate `token` events** per `messageId` to build the agent's response in real-time
3. **Show `tool_start`/`tool_end`** as UI feedback (e.g., "Recording your feedback...")
4. **Use `progress`** to show completion (e.g., "2/6 questions answered")
5. **Use `done`** to finalize and get the complete response

### Progress Object

```json
{
  "questionsCompleted": {
    "overall_impression": true,
    "ai_background": true,
    "difficulty": false,
    ...
  },
  "isComplete": false,
  "completedCount": 2,
  "totalQuestions": 6
}
```

---

## UI Suggestions

- Show a typing indicator while receiving `token` events
- When `tool_start` fires, show something like "💭 Notitie maken..."
- Display progress bar or counter showing `completedCount / totalQuestions`
- When `isComplete` becomes true, show a completion message and offer to view results

---

## Response Endpoints

Access and edit the structured feedback data extracted by the agent.

### Get All Responses

```
GET /api/interviews/:id/responses
```

Returns all recorded responses with metadata:

```json
{
  "sessionId": "uuid",
  "responses": {
    "ai_background": {
      "topic": "ai_background",
      "data": { "experienceLevel": 3, "summary": "..." },
      "timestamp": "2024-01-15T10:00:00.000Z",
      "source": "agent"
    }
  },
  "completedTopics": ["ai_background", "difficulty"],
  "totalTopics": 6
}
```

### Get Single Response

```
GET /api/interviews/:id/responses/:topic
```

Valid topics: `ai_background`, `overall_impression`, `difficulty`, `content_quality`, `presentation`, `suggestions`

### Update Response

```
PUT /api/interviews/:id/responses/:topic
Content-Type: application/json
Body: { "experienceLevel": 4, "summary": "Updated feedback" }
```

Updates a response and marks `source: "user_edit"` to track corrections.

---

## Data Model & Persistence

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            LangGraph Checkpoints Table                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ thread_id: "session-uuid"                       │  │  │
│  │  │ state: {                                        │  │  │
│  │  │   messages: [...],      ← conversation history  │  │  │
│  │  │   responses: {...},     ← structured feedback   │  │  │
│  │  │   questionsCompleted: {...}                     │  │  │
│  │  │ }                                               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

- **Single source of truth**: All data lives in LangGraph's checkpoint state
- **No separate tables**: Responses are stored alongside messages in the same state object
- **Automatic persistence**: `SqliteSaver` checkpoints state after every graph step
- **Thread-based**: Each interview session = one `thread_id` in the checkpointer

### Data Flow

1. **User sends message** → Agent processes → Tool extracts structured data
2. **Tool writes to state** → `responses.difficulty = { rating: 3, ... }`
3. **Checkpointer saves** → Full state persisted to SQLite
4. **API reads state** → `agent.getState()` retrieves current snapshot
5. **User edits** → `agent.updateState()` modifies and persists

### Why This Architecture?

- **Consistency**: Conversation and extracted data stay in sync
- **Resume anywhere**: Full state restored on reconnect
- **No migrations**: Adding fields to state "just works"
- **Audit trail**: Checkpointer keeps history of all state changes

---

## Notes

- The agent speaks Dutch
- The agent will naturally guide the conversation through 6 feedback topics
- Tool calls happen mid-stream (agent writes while talking)
- Session state persists - users can close and resume later
