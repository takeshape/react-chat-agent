import {
  type LLMOutputComponent,
  type LLMOutputFallbackBlock,
  useLLMOutput
} from '@llm-ui/react';
import { useCallback, useMemo } from 'react';
import type { ChatOutputBlock, ChatOutputFallbackBlock } from './types.ts';

const ICON_SIZE = '20px';

const SimpleTextComponent: LLMOutputComponent = ({ blockMatch }) => {
  return <div style={{ whiteSpace: 'pre-wrap' }}>{blockMatch.output}</div>;
};

const defaultFallbackBlock: LLMOutputFallbackBlock = {
  component: SimpleTextComponent,
  lookBack: ({ output }) => ({ output, visibleText: output })
};

export type LlmOutputProps = {
  llmOutput: string;
  messageId?: string;
  isStreamFinished: boolean;
  sendMessage: (message: string) => void;
  setFeedbackOpen: (
    isPositive: boolean,
    messageId: string,
    message: string
  ) => void;
  blocks?: ChatOutputBlock[];
  fallbackBlock?: ChatOutputFallbackBlock;
};

export function LLMOutput(props: LlmOutputProps) {
  const {
    llmOutput,
    sendMessage,
    setFeedbackOpen,
    messageId,
    isStreamFinished
  } = props;

  const wrapBlock = useCallback(
    <T extends ChatOutputFallbackBlock>(
      block: T
    ): Omit<T, 'component'> & { component: LLMOutputComponent } => {
      const Component = block.component;
      return {
        ...block,
        component: ({ blockMatch }) => {
          return (
            <Component sendMessage={sendMessage} blockMatch={blockMatch} />
          );
        }
      };
    },
    [sendMessage]
  );

  const fallbackBlock = useMemo(
    () => props.fallbackBlock && wrapBlock(props.fallbackBlock),
    [props.fallbackBlock, wrapBlock]
  );
  const blocks = useMemo(
    () => props.blocks?.map(wrapBlock),
    [props.blocks, wrapBlock]
  );

  const { blockMatches } = useLLMOutput({
    llmOutput,
    fallbackBlock: fallbackBlock ?? defaultFallbackBlock,
    blocks: blocks ?? [],
    isStreamFinished
  });

  const handleThumbsUp = useCallback(() => {
    if (messageId) {
      setFeedbackOpen(true, messageId, llmOutput);
    }
  }, [llmOutput, messageId, setFeedbackOpen]);

  const handleThumbsDown = useCallback(() => {
    if (messageId) {
      setFeedbackOpen(false, messageId, llmOutput);
    }
  }, [llmOutput, messageId, setFeedbackOpen]);

  return (
    <div>
      <div className="markdown-body !bg-transparent">
        {blockMatches.map((blockMatch) => {
          const Component = blockMatch.block.component;
          return (
            <Component key={blockMatch.outputRaw} blockMatch={blockMatch} />
          );
        })}
      </div>
      {messageId && (
        <div className="mt-2 flex gap-2 stroke-gray-500">
          <button
            type="button"
            className="cursor-pointer hover:stroke-red-600 "
            onClick={handleThumbsUp}
            onKeyUp={handleThumbsUp}
            tabIndex={0}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Thumbs up</title>
              <path
                d="M3 10C3 9.44772 3.44772 9 4 9H7V21H4C3.44772 21 3 20.5523 3 20V10Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 11V19L8.9923 20.3282C9.64937 20.7662 10.4214 21 11.2111 21H16.4586C17.9251 21 19.1767 19.9398 19.4178 18.4932L20.6119 11.3288C20.815 10.1097 19.875 9 18.6391 9H14"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 9L14.6872 5.56415C14.8659 4.67057 14.3512 3.78375 13.4867 3.49558V3.49558C12.6336 3.21122 11.7013 3.59741 11.2992 4.4017L8 11H7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="cursor-pointer hover:stroke-red-600 "
            onClick={handleThumbsDown}
            onKeyUp={handleThumbsDown}
            tabIndex={0}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Thumbs down</title>
              <path
                d="M21 14C21 14.5523 20.5523 15 20 15H17V3H20C20.5523 3 21 3.44772 21 4V14Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 13V5L15.0077 3.6718C14.3506 3.23375 13.5786 3 12.7889 3H7.54138C6.07486 3 4.82329 4.06024 4.5822 5.5068L3.38813 12.6712C3.18496 13.8903 4.12504 15 5.36092 15H10"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 15L9.31283 18.4358C9.13411 19.3294 9.64876 20.2163 10.5133 20.5044V20.5044C11.3664 20.7888 12.2987 20.4026 12.7008 19.5983L16 13H17"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
