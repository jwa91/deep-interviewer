// ═══════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
// TOOL ACTIVITY
// ═══════════════════════════════════════════════════════════════

export interface ToolActivity {
  name: string;
  isActive: boolean;
}

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
  }>;
  progress: ProgressState;
}
