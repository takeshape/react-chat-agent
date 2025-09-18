import type {
  LLMOutputBlock,
  LLMOutputComponent,
  LLMOutputFallbackBlock
} from '@llm-ui/react';

export type HistoryItem =
  | {
      type: 'llm';
      messageId: string;
      value: string;
      isStreamFinished?: boolean;
    }
  | {
      type: 'user';
      value: string;
    };

export type Reference = {
  _tid: string;
  data: ReferenceData;
};

export type ReferenceData = Record<string, unknown>;

export type ChatSession = {
  history: HistoryItem[];
  references?: Record<string, ReferenceData>;
  sessionMemory?: Record<string, unknown>;
  sessionId?: string;
  expires?: number;
};

export type ChatContext = {
  sendMessage: (message: string) => void;
  session: ChatSession;
};

export type ChatOutputComponent = LLMOutputComponent<ChatContext>;

export type ChatOutputFallbackBlock = Omit<
  LLMOutputFallbackBlock,
  'component'
> & {
  component: ChatOutputComponent;
};

export type ChatOutputBlock = Omit<LLMOutputBlock, 'component'> & {
  component: ChatOutputComponent;
};
