import { useMemo } from 'react';

export type AiChatWidgetPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

function getPositionClasses(position?: AiChatWidgetPosition) {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    default:
      return 'bottom-4 right-4';
  }
}

import { useAi } from '../../hooks/use-ai';
import {
  createTakeShapeClient,
  type TakeShapeClient
} from '../../takeshape-client.ts';
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
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  agentName?: string;
  inputName?: string;
  referenceDataFragment?: string;
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
  fallbackBlock,
  position = 'bottom-right',
  agentName = 'chat',
  inputName = 'chat',
  referenceDataFragment
}: AiChatWidgetProps) {
  const client = useMemo<TakeShapeClient>(
    () => createTakeShapeClient(endpoint, apiKey),
    [endpoint, apiKey]
  );

  const capEndpoint = useMemo(
    () => `${new URL(endpoint).origin}/protection/cap/`,
    [endpoint]
  );

  const positionClasses = useMemo(
    () => `fixed ${getPositionClasses(position)}`,
    [position]
  );

  const aiProps = useAi({
    client,
    capEndpoint,
    agentName,
    inputName,
    referenceDataFragment
  });
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
          className={`${positionClasses} w-48 z-30 bg-white p-2 border-2 border-black rounded-md cursor-pointer`}
          onClick={() => {
            setAiChatOpen(true);
          }}
        >
          Chat With AI Agent
        </button>
      )}
      {aiChatOpen && (
        <div
          className={`${positionClasses} w-96 z-30 bg-white border-2 border-black rounded-md`}
        >
          <div className="flex justify-end gap-4 bg-blue-800 px-3 py-1 text-white">
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
          agentName={agentName}
        />
      )}
    </>
  );
}
