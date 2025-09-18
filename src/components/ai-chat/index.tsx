import { useMemo } from 'react';
import { createTakeShapeClient, type TakeShapeClient } from '../../client.ts';
import { useAi } from '../../hooks/use-ai';
import type { ChatOutputBlock, ChatOutputFallbackBlock } from '../../types.ts';
import AiChat from './ai-chat.tsx';
import { ErrorBoundary } from './error-boundary.tsx';
import { Feedback } from './feedback.tsx';

export type AiChatWidgetProps = {
  endpoint: string;
  apiKey: string;
  email?: string;
  welcomeMessage?: string;
  suggestions?: string[];
  blocks?: ChatOutputBlock[];
  fallbackBlock?: ChatOutputFallbackBlock;
};

/**
 * AI Chat Widget
 */
export function AiChatWidget({
  endpoint,
  apiKey,
  email,
  welcomeMessage,
  suggestions,
  blocks,
  fallbackBlock
}: AiChatWidgetProps) {
  const client = useMemo<TakeShapeClient>(
    () => createTakeShapeClient(endpoint, apiKey),
    [endpoint, apiKey]
  );

  const capEndpoint = useMemo(
    () => `${new URL(endpoint).origin}/protection/cap/`,
    [endpoint]
  );

  const aiProps = useAi(client, capEndpoint);
  const {
    resetSession,
    aiChatOpen,
    setAiChatOpen,
    feedbackOpen,
    setFeedbackClosed,
    selectedMessageId,
    selectedMessage,
    isPositive
  } = aiProps;

  return (
    <>
      {!aiChatOpen && (
        <button
          type="button"
          className="fixed bottom-4 left-4 w-48 z-30 bg-white p-2 border-2 border-black rounded-md cursor-pointer"
          onClick={() => {
            setAiChatOpen(true);
          }}
        >
          Chat With AI Agent
        </button>
      )}
      {aiChatOpen && (
        <div className="fixed bottom-4 left-4 w-96 z-30 bg-white border-2 border-black rounded-md">
          <div className="flex justify-end gap-4 bg-navy px-3 py-1 text-white">
            <button
              type="button"
              className="hover:underline cursor-pointer"
              onClick={() => resetSession()}
            >
              New Chat
            </button>
            <button
              type="button"
              className="hover:underline cursor-pointer"
              onClick={() => {
                setAiChatOpen(false);
              }}
            >
              Close
            </button>
          </div>
          <div className="p-2">
            <ErrorBoundary>
              <AiChat
                {...aiProps}
                welcomeMessage={welcomeMessage}
                suggestions={suggestions}
                blocks={blocks}
                fallbackBlock={fallbackBlock}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}
      {feedbackOpen && (
        <Feedback
          client={client}
          email={email ?? null}
          setFeedbackClosed={setFeedbackClosed}
          selectedMessageId={selectedMessageId}
          selectedMessage={selectedMessage}
          isPositive={isPositive}
        />
      )}
    </>
  );
}
