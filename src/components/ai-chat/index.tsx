import { useAi } from '../../hooks/use-ai';
import { useAiStore } from '../../stores/ai-store';
import AiChat from './ai-chat.tsx';
import { ErrorBoundary } from './error-boundary.tsx';
import { Feedback } from './feedback.tsx';

/**
 * AI Chat Widget
 */
export function AiChatWidget() {
  const aiChatOpen = useAiStore((state) => state.aiChatOpen);
  const setAiChatOpen = useAiStore((state) => state.setAiChatOpen);
  const feedbackOpen = useAiStore((state) => state.feedbackOpen);
  const { resetSession } = useAi();

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
              <AiChat />
            </ErrorBoundary>
          </div>
        </div>
      )}
      {feedbackOpen && <Feedback />}
    </>
  );
}
