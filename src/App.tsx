import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Spinner } from "./components/ui/spinner";
import {
	ChatContainer,
	CompletionModal,
	WelcomeScreen,
	createDefaultProgress,
	useChatStream,
	useInterviewSession,
} from "./features/interview";
import type { ChatItem, Message, ProgressState } from "./features/interview";
import { DebugOverlay } from "./features/interview/components/debug-overlay";
import { useAppConfig } from "./hooks/use-app-config";
import { WELCOME_MESSAGE } from "./shared/constants";
import { toolNameToQuestionId } from "./shared/schema";

// Welcome message for new sessions - matches what's stored in LangGraph state
const createWelcomeMessage = (): Message => ({
	id: "welcome",
	role: "assistant",
	content: WELCOME_MESSAGE,
	timestamp: new Date(),
});

// Convert Message to ChatItem
const messageToItem = (message: Message): ChatItem => {
	return {
		type: "message",
		id: message.id,
		data: message,
	};
};

// Helper to restore chat items from messages including tool calls
const restoreChatItems = (
	messages: Message[],
	workshopSlidesUrl: string | null,
): ChatItem[] => {
	const items: ChatItem[] = [];

	for (const msg of messages) {
		// Add the text message first (so it introduces the tool output)
		if (msg.content) {
			items.push({
				type: "message",
				id: msg.id,
				data: msg,
			});
		}

		// If message has tool calls, add tool cards after the text
		if (msg.toolCalls && msg.toolCalls.length > 0) {
			for (const [index, toolCall] of msg.toolCalls.entries()) {
				if (toolCall.name === "provide_workshop_slides" && workshopSlidesUrl) {
					items.push({
						type: "slide_link",
						id: `${msg.id}_slide_${index}`,
						data: {
							url: workshopSlidesUrl,
						},
					});
					continue;
				}

				const questionId = toolNameToQuestionId(toolCall.name);
				if (questionId) {
					items.push({
						type: "tool_card",
						id: `${msg.id}_tool_${index}`,
						data: {
							questionId,
							state: "completed", // Restored tools are always completed
						},
					});
				}
			}
		}
	}

	return items;
};

function MainApp() {
	const { config, isLoading: configLoading } = useAppConfig();
	const {
		session,
		progress,
		isLoading: sessionLoading,
		error: sessionError,
		existingMessages,
		startSession,
		updateProgress,
		clearSession,
	} = useInterviewSession();

	const [showCompletionModal, setShowCompletionModal] = useState(false);
	const [localProgress, setLocalProgress] = useState<ProgressState>(
		createDefaultProgress(),
	);

	const handleProgressUpdate = useCallback(
		(newProgress: ProgressState) => {
			setLocalProgress(newProgress);
			updateProgress(newProgress);
		},
		[updateProgress],
	);

	const handleComplete = useCallback(() => {
		setShowCompletionModal(true);
	}, []);

	const {
		chatItems,
		isStreaming,
		error: chatError,
		sendMessage,
		setChatItems,
	} = useChatStream({
		sessionId: session?.sessionId ?? null,
		workshopSlidesUrl: config.workshopSlidesUrl,
		onProgressUpdate: handleProgressUpdate,
		onComplete: handleComplete,
	});

	const handleLeave = useCallback(() => {
		clearSession();
		setChatItems([]);
		setLocalProgress(createDefaultProgress());
		setShowCompletionModal(false);
	}, [clearSession, setChatItems]);

	// Initialize with welcome message or restore existing messages
	useEffect(() => {
		// Only initialize if chatItems is empty to avoid overwriting ongoing conversation
		if (chatItems.length === 0 && !configLoading) {
			if (existingMessages.length > 0) {
				// Restore existing conversation with tool cards
				setChatItems(
					restoreChatItems(existingMessages, config.workshopSlidesUrl),
				);
			} else if (session?.sessionId) {
				// New session - show welcome message (also stored in LangGraph state)
				setChatItems([messageToItem(createWelcomeMessage())]);
			}
		}
	}, [
		session?.sessionId,
		existingMessages,
		setChatItems,
		chatItems.length,
		config.workshopSlidesUrl,
		configLoading,
	]);

	// Sync progress from session hook
	useEffect(() => {
		// Only update local progress if the new progress is different/relevant
		// This allows reset when progress.completedCount goes back to 0
		setLocalProgress(progress);

		// Check if session is already complete upon loading
		if (progress.isComplete) {
			setShowCompletionModal(true);
		}
	}, [progress]);

	// Show loading spinner while checking for existing session or loading config
	if (sessionLoading || configLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<Spinner className="mx-auto h-8 w-8 text-primary" />
					<p className="mt-4 font-mono text-muted-foreground text-sm">
						Laden...
					</p>
				</div>
			</div>
		);
	}

	// Show welcome screen if no session
	if (!session) {
		return (
			<WelcomeScreen
				onStart={startSession}
				isLoading={sessionLoading}
				error={sessionError}
			/>
		);
	}

	// Show chat interface
	return (
		<>
			<ChatContainer
				chatItems={chatItems}
				sessionId={session.sessionId}
				progress={localProgress}
				isStreaming={isStreaming}
				error={chatError}
				onSendMessage={sendMessage}
				onLeave={handleLeave}
				onShowCompletion={() => setShowCompletionModal(true)}
			/>
			<CompletionModal
				isOpen={showCompletionModal}
				onClose={() => setShowCompletionModal(false)}
				workshopSlidesUrl={config.workshopSlidesUrl}
			/>
		</>
	);
}

function App() {
	// Check for debug mode
	const searchParams = new URLSearchParams(window.location.search);
	const isDebug = searchParams.get("debug") === "true";

	return (
		<>
			{isDebug && <DebugOverlay />}
			<MainApp />
		</>
	);
}

export default App;
