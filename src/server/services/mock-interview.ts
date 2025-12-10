import { WELCOME_MESSAGE } from "@/shared/constants";
import { HumanMessage } from "@langchain/core/messages";
import type { Message, ProgressState } from "@/features/interview/types";
import { MOCK_RESPONSES } from "@/features/interview/mocks/interview-data";

interface ScriptStep {
  id: string;
  assistantMessage?: string;
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
    output: string; // The "result" of the tool
  };
  suggestedUserReply?: string;
  progressUpdate?: Partial<ProgressState>;
}

// Define the linear script of the interview
const SCRIPT: ScriptStep[] = [
  {
    id: "step_0",
    assistantMessage: WELCOME_MESSAGE,
    suggestedUserReply: "Hoi, is goed. Ik had er nog niet zoveel ervaring mee, alleen wat gespeeld met ChatGPT.",
  },
  {
    id: "step_1",
    toolCall: {
      name: "record_ai_background",
      args: MOCK_RESPONSES.ai_background.data as Record<string, unknown>,
      output: "AI Background recorded.",
    },
    assistantMessage: "Helder. En waar gebruikte je ChatGPT dan voornamelijk voor? (Dit is een mock vraag)",
    suggestedUserReply: "Vooral voor het brainstormen over nieuwe ideeën voor marketing teksten.",
  },
  {
    id: "step_2",
    assistantMessage: "Duidelijk! Wat was je algemene indruk van de training vandaag?",
    toolCalls: [
        // Just demonstrating we can do multiple if needed, but script usually has one per step
    ],
    suggestedUserReply: "Ik vond het erg leerzaam en leuk gebracht.",
  },
  {
    id: "step_3",
    toolCall: {
      name: "record_overall_impression",
      args: MOCK_RESPONSES.overall_impression.data as Record<string, unknown>,
      output: "Overall impression recorded.",
    },
    assistantMessage: "Fijn om te horen. Wat vond je van de inhoud? Kwam het overeen met wat je verwachtte?",
    suggestedUserReply: "Ja, de inhoud was goed. Vooral het stuk over prompting.",
  },
  {
    id: "step_4",
    toolCall: {
      name: "record_perceived_content",
      args: MOCK_RESPONSES.perceived_content.data as Record<string, unknown>,
      output: "Perceived content recorded.",
    },
    assistantMessage: "Hoe vond je de moeilijkheidsgraad van de training?",
    suggestedUserReply: "Het was goed te volgen, soms ging het wel wat snel.",
  },
  {
    id: "step_5",
    toolCall: {
      name: "record_difficulty",
      args: MOCK_RESPONSES.difficulty.data as Record<string, unknown>,
      output: "Difficulty recorded.",
    },
    assistantMessage: "En wat vond je van de kwaliteit van het materiaal?",
    suggestedUserReply: "Het zag er verzorgd uit, maar ik miste wat diepgang bij de technische uitleg.",
  },
  {
    id: "step_6",
    toolCall: {
      name: "record_content_quality",
      args: MOCK_RESPONSES.content_quality.data as Record<string, unknown>,
      output: "Content quality recorded.",
    },
    assistantMessage: "Hoe heb je de presentatie zelf ervaren?",
    suggestedUserReply: "De spreker was erg enthousiast en hield de aandacht goed vast.",
  },
  {
    id: "step_7",
    toolCall: {
      name: "record_presentation",
      args: MOCK_RESPONSES.presentation.data as Record<string, unknown>,
      output: "Presentation recorded.",
    },
    assistantMessage: "Was alles duidelijk, of waren er onderwerpen die je nog niet helemaal snapt?",
    suggestedUserReply: "Het stuk over RAG vond ik nog wel lastig.",
  },
  {
    id: "step_8",
    toolCall: {
      name: "record_clarity",
      args: MOCK_RESPONSES.clarity.data as Record<string, unknown>,
      output: "Clarity recorded.",
    },
    assistantMessage: "Heb je nog suggesties voor verbetering?",
    suggestedUserReply: "Misschien wat meer oefentijd inruimen.",
  },
  {
    id: "step_9",
    toolCall: {
      name: "record_suggestions",
      args: MOCK_RESPONSES.suggestions.data as Record<string, unknown>,
      output: "Suggestions recorded.",
    },
    assistantMessage: "Tot slot, wat vond je van de balans tussen theorie en praktijk?",
    suggestedUserReply: "De praktijk vond ik het leukst, theorie was ook nodig.",
  },
  {
    id: "step_10",
    toolCall: {
      name: "record_course_parts",
      args: MOCK_RESPONSES.course_parts.data as Record<string, unknown>,
      output: "Course parts recorded.",
    },
    assistantMessage: "Bedankt voor al je feedback! We zijn klaar.",
    suggestedUserReply: "/complete",
  },
];

interface MockState {
  currentStep: number;
  messages: any[]; // Using any to match the format expected by the route
  responses: Record<string, any>;
  progress: ProgressState;
  createdAt: string;
  isComplete: boolean;
}

class MockInterviewService {
  private state: MockState;

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      currentStep: 0,
      messages: [],
      responses: {},
      progress: {
        questionsCompleted: {},
        completedCount: 0,
        totalQuestions: 9,
        isComplete: false,
      },
      createdAt: new Date().toISOString(),
      isComplete: false,
    };
    
    // Initial welcome message is NOT added to messages list for "step_0"
    // This is because the frontend (useInterviewSession) often initializes with a welcome message locally
    // if the session is new.
    // However, for consistency with the backend state, we SHOULD have it.
    // The issue of "double message" likely comes from the frontend showing a local welcome message AND fetching this one.
    // In the real app, `useInterviewSession` creates a fresh session which is empty, then `App.tsx` adds the welcome message locally.
    // BUT `mockInterviewService` acts as the *persisted* state.
    // If the frontend sees an existing session with messages, it restores them.
    // If it sees an empty session, it shows the local welcome message.
    
    // STRATEGY: Initialize with NO messages. 
    // The frontend logic `if (existingMessages.length > 0) ... else ... setChatItems([welcome])` will handle showing the welcome message.
    // But wait, step_0 is the state "waiting for user reply to welcome".
    // So the script starts at step_0.
  }

  private addAssistantMessage(content: string) {
    this.state.messages.push({
      role: "assistant",
      content,
      timestamp: new Date(),
    });
  }

  getState() {
    return this.state;
  }

  getSuggestedReply(): string {
    const step = SCRIPT[this.state.currentStep];
    return step?.suggestedUserReply || "";
  }

  jumpTo(stepIndex: number) {
    if (stepIndex < 0 || stepIndex >= SCRIPT.length) return;

    this.reset(); // Clear history first

    // Replay up to stepIndex
    for (let i = 0; i <= stepIndex; i++) {
        const step = SCRIPT[i];
        
        // Add assistant message if it exists (for step 0, it's the welcome message)
        // For step 0, we DO add it to history if we are jumping, because "restoring" a session means fetching history.
        if (step.assistantMessage) {
             this.addAssistantMessage(step.assistantMessage);
        }

        // Execute this step's assistant logic (tool calls)
        if (step.toolCall) {
            // Update responses map FIRST so it's available for fetching
            const topic = Object.keys(MOCK_RESPONSES).find(k => k.includes(step.toolCall!.name.replace("record_", "")));
            if (topic) {
                this.state.responses[topic] = {
                    topic,
                    data: step.toolCall.args,
                    timestamp: new Date().toISOString(),
                    source: "agent"
                };
                (this.state.progress.questionsCompleted as any)[topic] = true;
                this.state.progress.completedCount++;
            }

            // In the real LangGraph state, tool calls are attached to the AIMessage.
            // Here we need to update the last assistant message to include the tool call
            const lastMsg = this.state.messages[this.state.messages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
                if (!lastMsg.toolCalls) lastMsg.toolCalls = [];
                lastMsg.toolCalls.push({
                    name: step.toolCall.name,
                    args: step.toolCall.args,
                    id: `call_${Date.now()}_${i}`
                });
            }
        }

        // Sim user reply for previous step if we are past it
        if (i < stepIndex) {
             if (step.suggestedUserReply) {
                this.state.messages.push({
                    role: "user",
                    content: step.suggestedUserReply,
                    timestamp: new Date()
                });
            }
        }
    }
    
    this.state.currentStep = stepIndex;
  }

  async processMessage(message: string) {
    // Add user message
    this.state.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Advance step
    this.state.currentStep++;
    const nextStep = SCRIPT[this.state.currentStep];

    if (!nextStep) {
        this.addAssistantMessage("Einde simulatie.");
        return {
            fullResponse: "Einde simulatie.",
            toolCalls: [],
            progress: this.state.progress
        };
    }

    const toolCalls = [];
    
    // Check for tool call
    if (nextStep.toolCall) {
        toolCalls.push(nextStep.toolCall);
        
        // Update mock state
        const topic = Object.keys(MOCK_RESPONSES).find(k => k.includes(nextStep.toolCall!.name.replace("record_", "")));
        if (topic) {
            // Update responses map immediately so it's available for the tool card fetch
            this.state.responses[topic] = {
                topic,
                data: nextStep.toolCall.args,
                timestamp: new Date().toISOString(),
                source: "agent"
            };
            (this.state.progress.questionsCompleted as any)[topic] = true;
            this.state.progress.completedCount++;
        }
    }

    // Add assistant message if it exists (but after tool execution logic)
    // The "standard" flow is: User Reply -> Agent: "Okay, noted" + Tool Call -> Agent: "Next Question"
    // Our simplified script structure combines "Okay, noted + Tool Call" and "Next Question" into one step mostly.
    // However, the user issue is that the order is wrong.
    // Ideally:
    // 1. User says "It was good"
    // 2. Agent says "Okay good" + Tool Call (record_impression)
    // 3. Agent says "Next Question?"
    
    // In our current script structure:
    // step_2 (User: "It was good") -> leads to -> step_3 (Tool: record_impression + Assistant: "Next question?")
    
    // This results in:
    // User: "It was good"
    // Assistant: "Next question?" (plus invisible tool call)
    // Tool Card appears.
    
    // If the tool card appears *after* the assistant text, it looks like:
    // User
    // Assistant: Next Question
    // Tool Card (Summary of previous)
    
    // This is confusing. The tool card is a summary of what JUST happened.
    // So the order in the stream should be:
    // 1. Tool Call (renders as card)
    // 2. Assistant Text (Next question)
    // OR
    // 1. Assistant Text (Acknowledgement)
    // 2. Tool Call
    // 3. Assistant Text (Next question)
    
    // The current stream implementation in interview.ts does:
    // 1. Tool Start/End (Streamed first if in result.toolCalls)
    // 2. Message Start/Tokens/End (Streamed second)
    
    // So visually:
    // [Tool Card]
    // [Assistant Message]
    
    // User says: "Tool card is empty" -> this is a data fetch issue (fixed below).
    // User says: "Order is wrong: User Reply -> Agent Next Question -> Agent Note"
    // If the user sees:
    // User: "It was good"
    // Agent: "Next Question?"
    // Note: [Empty]
    
    // This implies the Tool Card is rendered AFTER the message in the stream?
    // Let's check interview.ts stream logic.
    // It streams tool calls FIRST.
    // So it should be: [Card] then [Text].
    
    // If the user sees [Text] then [Card], maybe the client renders them in order of arrival but...
    // The client accumulates `chatItems`.
    // If tool calls come first, they are added to `chatItems`?
    // Actually, `useChatStream` handles `tool_end` by adding a `ToolCard`.
    // It handles `message_start` by adding a message.
    
    // If the backend streams: tool_start -> tool_end -> message_start -> tokens -> message_end.
    // The client will render: Tool Card, then Message.
    
    // The user claimed: "then i see an agent message... thenh i see the agent note"
    // This suggests the backend is streaming message BEFORE tool?
    // Checking `interview.ts`:
    // It iterates `result.toolCalls`.
    // Then it streams text tokens.
    // So backend sends Tool THEN Text.
    
    // Wait, in `jumpTo` we populate history.
    // In `processMessage` we return `toolCalls` and `fullResponse`.
    
    // The issue might be simply that the Agent Note data isn't found when clicked.
    // That's because `useTopicResponse` calls the API.
    // We need to make sure the API returns the data we JUST put in `this.state.responses`.
    // I added the logic to update `this.state.responses` in the `if (nextStep.toolCall)` block above.
    // That should fix the "empty card" issue.
    
    if (nextStep.assistantMessage) {
        this.addAssistantMessage(nextStep.assistantMessage);
        
        // Attach tool calls to the message we just added
         if (toolCalls.length > 0) {
            const lastMsg = this.state.messages[this.state.messages.length - 1];
            lastMsg.toolCalls = toolCalls.map((tc, idx) => ({
                name: tc.name,
                args: tc.args,
                id: `call_${Date.now()}_${idx}`
            }));
        }
    }
    
    if (nextStep.id === "step_10") {
        this.state.isComplete = true;
        this.state.progress.isComplete = true;
    }

    return {
        fullResponse: nextStep.assistantMessage || "",
        toolCalls: toolCalls.map(tc => ({ name: tc.name, args: tc.args })),
        progress: this.state.progress
    };
  }
}

// Singleton instance
export const mockInterviewService = new MockInterviewService();

