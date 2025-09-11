import type { ChangeEventHandler, FormEventHandler } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UseAi } from '../../hooks/use-ai.ts';
import { ChatBubble } from './chat-bubble.tsx';
import { ErrorMessage } from './error-message.tsx';
import { LLMOutput } from './llm-output.tsx';
import { Loading } from './loading.tsx';
import Suggestions from './suggestions.tsx';

/**
 * Return true if element is fully in view within container (defaults to window)
 */
export const isElementInView = (
  element: HTMLElement,
  container: HTMLElement | null = null
) => {
  const rect = element.getBoundingClientRect();
  const containerRect = container
    ? container.getBoundingClientRect()
    : {
        top: 0,
        bottom: window.innerHeight || document.documentElement.clientHeight
      };

  return rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
};

export type AiChatProps = {
  welcomeMessage?: string;
  suggestions?: string[];
} & UseAi;

export default function AiChat({
  welcomeMessage: welcomeMessageProp,
  suggestions,
  session,
  sendMessage,
  mutate,
  reset,
  error,
  loading,
  setLoading,
  inputText,
  setInputText,
  inputRef,
  setFeedbackOpen
}: AiChatProps) {
  const { history = [], sessionId } = session ?? {};
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<HTMLDivElement>(null);
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [welcome, setWelcome] = useState<null | string>(null);
  const initialized = useRef(false);

  // Send initial message if email is known
  // Note that the email can be initially empty when it's about to be pulled from localstorage
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    if (welcomeMessageProp) {
      setWelcome(welcomeMessageProp);
    }
    setWelcomeProgress(100);
  }, [welcomeMessageProp]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: check scroll top when history changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (welcome && welcomeProgress < 100) {
      const timeout = setTimeout(() => {
        setWelcomeProgress((prev) => prev + 2);
      }, 10);

      return () => clearTimeout(timeout);
    }
  }, [welcomeProgress, welcome]);

  const welcomeMessage = useMemo(() => {
    const amountToShow = welcome
      ? Math.ceil(welcome.length * (welcomeProgress / 100))
      : 0;
    return welcome ? welcome.substring(0, amountToShow) : null;
  }, [welcome, welcomeProgress]);

  const isWelcomeFinished = useMemo(() => {
    return Boolean(welcome && welcomeProgress === 100);
  }, [welcomeProgress, welcome]);

  useEffect(() => {
    if (scrollContainerRef.current && history.length > 0) {
      if (history.length > 0) {
        if (
          currentMessageRef.current &&
          !isElementInView(
            currentMessageRef.current,
            scrollContainerRef.current
          )
        ) {
          currentMessageRef.current.scrollIntoView({ block: 'start' });
        }
      }
    }
  }, [history]);

  const submitChat: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      if (inputText.trim() === '') {
        return;
      }
      sendMessage(inputText);
    },
    [inputText, sendMessage]
  );

  const changeMessage: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setInputText(e.target.value);
    },
    [setInputText]
  );

  const retry = useCallback(() => {
    reset();
    setLoading(true);
    const lastMessage = history[history.length - 1];
    if (lastMessage) {
      mutate({
        input: lastMessage.value,
        sessionId
      });
    }
  }, [reset, setLoading, history, mutate, sessionId]);

  if (error) {
    return <ErrorMessage retry={retry}>{error.message}</ErrorMessage>;
  }

  return (
    <>
      <div className={'h-96 overflow-y-auto'} ref={scrollContainerRef}>
        <div className={`mx-auto px-4 max-w-2xl pb-4`}>
          {welcome && welcomeMessage && (
            <div className="mb-4">
              <LLMOutput
                llmOutput={welcomeMessage}
                isStreamFinished={isWelcomeFinished}
                sendMessage={sendMessage}
                setFeedbackOpen={setFeedbackOpen}
              />
            </div>
          )}
          {history.map((item, index) => (
            <div
              key={
                item.type === 'llm' && item.messageId
                  ? item.messageId
                  : `${item.type}-${index}`
              }
              ref={index === history.length - 1 ? currentMessageRef : undefined}
            >
              {item.type === 'user' && <ChatBubble text={item.value} />}
              {item.type === 'llm' && (
                <LLMOutput
                  llmOutput={item.value}
                  messageId={item.messageId}
                  isStreamFinished={Boolean(item.isStreamFinished)}
                  sendMessage={sendMessage}
                  setFeedbackOpen={setFeedbackOpen}
                />
              )}
            </div>
          ))}
          {loading && !(welcome && !isWelcomeFinished) && (
            <div className="flex justify-center mt-8">
              <Loading />
            </div>
          )}
          {history.length === 0 && !loading && (
            <Suggestions sendMessage={sendMessage} suggestions={suggestions} />
          )}
        </div>
      </div>
      <form className="w-full" onSubmit={submitChat}>
        <div className="flex items-center">
          <input
            name="message"
            placeholder="Message"
            value={inputText}
            onChange={changeMessage}
            className="w-[100%] p-1 border-1 border-gray-500"
            disabled={loading}
            ref={inputRef}
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Input"
            className="ml-2"
          >
            <svg
              className="fill-transparent stroke-neutral-600 w-6"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Send message</title>
              <path
                d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}
