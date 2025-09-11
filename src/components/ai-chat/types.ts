import type {
  LLMOutputBlock,
  LLMOutputComponent,
  LLMOutputFallbackBlock
} from '@llm-ui/react';

type ChatContext = {
  sendMessage: (message: string) => void;
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
