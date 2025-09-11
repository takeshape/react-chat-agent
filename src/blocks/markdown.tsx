import { markdownLookBack } from '@llm-ui/markdown';
import type { LLMOutputComponent, LLMOutputFallbackBlock } from '@llm-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
};

export const markdownBlock: LLMOutputFallbackBlock = {
  component: MarkdownComponent,
  lookBack: markdownLookBack()
};
