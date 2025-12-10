// ═══════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════

export type MessageRole = "user" | "assistant";

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  id?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
}

// ═══════════════════════════════════════════════════════════════
// SESSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface SessionState {
  code: string;
  sessionId: string;
}

export interface InterviewState {
  session: SessionState | null;
  messages: Message[];
  progress: ProgressState;
  isLoading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS TYPES
// ═══════════════════════════════════════════════════════════════

export interface QuestionCompletion {
  ai_background: boolean;
  overall_impression: boolean;
  perceived_content: boolean;
  difficulty: boolean;
  content_quality: boolean;
  presentation: boolean;
  clarity: boolean;
  suggestions: boolean;
  course_parts: boolean;
}

export interface ProgressState {
  questionsCompleted: QuestionCompletion;
  completedCount: number;
  totalQuestions: number;
  isComplete: boolean;
}

// ═══════════════════════════════════════════════════════════════
// SSE EVENT TYPES
// ═══════════════════════════════════════════════════════════════

export interface SSETokenEvent {
  content: string;
}

export interface SSEToolStartEvent {
  name: string;
  input?: Record<string, unknown>;
}

export interface SSEToolEndEvent {
  name: string;
  output: string;
}

export interface SSEProgressEvent {
  questionsCompleted: QuestionCompletion;
  completedCount: number;
  totalQuestions: number;
  isComplete: boolean;
}

export interface SSEDoneEvent {
  fullResponse: string;
  toolCalls: Array<{
    name: string;
    input: Record<string, unknown>;
    output: string;
  }>;
  progress: SSEProgressEvent;
}

export interface SSEErrorEvent {
  error: string;
}

export type SSEEventType = "token" | "tool_start" | "tool_end" | "progress" | "done" | "error";

// ═══════════════════════════════════════════════════════════════
// CHAT ITEMS - Unified stream items for rendering
// ═══════════════════════════════════════════════════════════════

export interface ToolCardData {
  questionId: QuestionId;
  state: "active" | "completed";
}

export type ChatItemType = "message" | "tool_card" | "slide_link";

export type ChatItem =
  | { type: "message"; id: string; data: Message }
  | { type: "tool_card"; id: string; data: ToolCardData }
  | { type: "slide_link"; id: string; data: { url: string } };

// ═══════════════════════════════════════════════════════════════
// API TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateSessionResponse {
  id: string;
  createdAt: string;
}

export interface GetSessionResponse {
  id: string;
  createdAt: string;
  messages: Array<{
    role: MessageRole;
    content: string;
    toolCalls?: ToolCall[];
  }>;
  progress: ProgressState;
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE API TYPES
// ═══════════════════════════════════════════════════════════════

export type QuestionId =
  | "ai_background"
  | "overall_impression"
  | "perceived_content"
  | "difficulty"
  | "content_quality"
  | "presentation"
  | "clarity"
  | "suggestions"
  | "course_parts";

export type ResponseSource = "agent" | "user_edit";

export interface TopicResponseDTO {
  topic: QuestionId;
  data: Record<string, unknown>;
  timestamp: string;
  source: ResponseSource;
}

export interface GetAllResponsesResponse {
  sessionId: string;
  responses: Record<string, TopicResponseDTO>;
  completedTopics: QuestionId[];
  totalTopics: 9;
}

export interface GetTopicResponseResponse extends TopicResponseDTO {}

export interface UpdateTopicResponseRequest {
  [key: string]: unknown;
}

export interface UpdateTopicResponseResponse extends TopicResponseDTO {}
