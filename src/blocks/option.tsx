'use client';
import type { BlockMatch } from '@llm-ui/react';
import { useCallback, useMemo } from 'react';
import type { ChatOutputBlock } from '../types.ts';

export const Option = ({
  blockMatch,
  sendMessage
}: {
  blockMatch: BlockMatch;
  sendMessage: (message: string) => void;
}) => {
  const linkText = useMemo(() => {
    return blockMatch.outputRaw.replace(/\*\s*Option ?\w?:\s+/, '');
  }, [blockMatch.outputRaw]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      sendMessage(linkText);
    },
    [linkText, sendMessage]
  );

  return (
    <li className="ml-6 ">
      <button
        type="button"
        className="text-blue-600 hover:underline cursor-pointer"
        onClick={handleClick}
      >
        {linkText}
      </button>
    </li>
  );
};

export const optionsBlock: ChatOutputBlock = {
  component: ({ blockMatch, sendMessage }) => (
    <Option blockMatch={blockMatch} sendMessage={sendMessage} />
  ),
  findCompleteMatch: (str) => {
    const execResult = /^\s*\*\s*Option ?\w?:.*$/dgm.exec(str);
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
  lookBack: (args) => {
    const { output } = args;
    return {
      output,
      visibleText: output
    };
  }
};
