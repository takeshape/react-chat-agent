import type { BlockMatch } from '@llm-ui/react';
import { useCallback, useMemo } from 'react';

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
