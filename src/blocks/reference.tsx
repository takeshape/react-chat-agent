import type { LLMOutputComponent } from '@llm-ui/react';
import type { ChatContext, ChatOutputBlock } from '../types.ts';

export type ReferenceComponent = LLMOutputComponent<
  ChatContext & { tid: string }
>;

export function createReferenceBlock(
  Component: ReferenceComponent,
  shapeRef: string
): ChatOutputBlock {
  if (shapeRef.split(':').length !== 2) {
    throw new Error('Invalid shape reference');
  }
  return {
    component: (props) => {
      const tid = props.blockMatch.outputRaw;
      return <Component {...props} tid={tid} />;
    },
    findCompleteMatch: (str) => {
      const execResult = new RegExp(
        `\\btid:${shapeRef}:([\\w\\\\/:-_~]+)`,
        'dg'
      ).exec(str);
      const firstResult = execResult?.indices?.[0];
      if (firstResult) {
        return {
          startIndex: firstResult[0],
          endIndex: firstResult[1],
          outputRaw: execResult[0]
        };
      }
    },
    findPartialMatch: () => {
      return undefined;
    },
    lookBack: ({ output }) => {
      return {
        output,
        visibleText: output
      };
    }
  };
}
