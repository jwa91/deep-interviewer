# Interview API Guide for Frontend

## Overview

The backend exposes a streaming chat API using Server-Sent Events (SSE). The frontend should create interview sessions and then stream chat messages.

## Flow

1. **Create a session** → `POST /api/interviews`
2. **Send messages** → `POST /api/interviews/:id/chat` (returns SSE stream)
3. **Check progress** → `GET /api/interviews/:id`
4. **Get results** → `GET /api/interviews/:id/results` (when complete)

---

## Creating a Session

```
POST /api/interviews
```

Returns `{ id, createdAt }`. Store the `id` for subsequent requests.

---

## Sending a Message (SSE Stream)

```
POST /api/interviews/:id/chat
Content-Type: application/json
Body: { "message": "user's message here" }
```

Returns an SSE stream with the following event types:

### Event Types

| Event | Description | Data |
|-------|-------------|------|
| `token` | Streaming text chunk | `{ content: "..." }` |
| `tool_start` | Agent is recording feedback | `{ name: "record_...", input: {...} }` |
| `tool_end` | Feedback recorded | `{ name: "record_...", output: "✓ ..." }` |
| `progress` | Updated completion status | `{ questionsCompleted, isComplete, completedCount, totalQuestions }` |
| `done` | Stream finished | `{ fullResponse, toolCalls, progress }` |
| `error` | Something went wrong | `{ error: "..." }` |

### Handling the Stream

1. **Accumulate `token` events** to build the agent's response in real-time
2. **Show `tool_start`/`tool_end`** as UI feedback (e.g., "Recording your feedback...")
3. **Use `progress`** to show completion (e.g., "2/9 questions answered")
4. **Use `done`** to finalize the message and get the complete response

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
  "totalQuestions": 9
}
```

---

## UI Suggestions

- Show a typing indicator while receiving `token` events
- When `tool_start` fires, show something like "💭 Notitie maken..." 
- Display progress bar or counter showing `completedCount / totalQuestions`
- When `isComplete` becomes true, show a completion message and offer to view results

---

## Notes

- The agent speaks Dutch
- The agent will naturally guide the conversation through 9 feedback topics
- Tool calls happen mid-stream (agent writes while talking)
- Session state persists - users can close and resume later

