// Main container
export { ChatContainer } from "./chat-container";

// Subfeatures
export { CompletionFooter, MessageInput, TypingIndicator } from "./input";
export {
  AgentNoteCard,
  MessageBubble,
  MessageList,
  SlideLinkCard,
} from "./messages";
export { ChatHeader, ProgressBar, SummaryModal } from "./progress";

// Hooks
export { useChatStream, createDefaultProgress } from "./hooks/use-chat-stream";
export { useInterviewSession } from "./hooks/use-interview-session";
export { useTopicResponse } from "./hooks/use-topic-response";

// Types
export type {
  Message,
  MessageRole,
  SessionState,
  InterviewState,
  ProgressState,
  QuestionCompletion,
  QuestionId,
  ChatItem,
  ChatItemType,
  ToolCardData,
  ToolCall,
  SSETokenEvent,
  SSEToolStartEvent,
  SSEToolEndEvent,
  SSEProgressEvent,
  SSEDoneEvent,
  SSEErrorEvent,
  SSEEventType,
  CreateSessionResponse,
  GetSessionResponse,
} from "./types";
