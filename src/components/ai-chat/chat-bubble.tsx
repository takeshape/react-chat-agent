import type { AiChatTheme } from '../../types/theme.ts';

export function ChatBubble({
  text,
  theme
}: {
  text: string;
  theme?: Required<AiChatTheme>;
}) {
  return (
    <div className="my-8 text-right">
      <div
        className="p-3 rounded-xl inline-block"
        style={{
          backgroundColor: theme?.userBubble.backgroundColor || '#1d4ed8',
          color: theme?.userBubble.textColor || '#ffffff'
        }}
      >
        {text}
      </div>
    </div>
  );
}
