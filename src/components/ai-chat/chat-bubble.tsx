export function ChatBubble({ text }: { text: string }) {
  return (
    <div className="my-8 text-right">
      <div className="bg-blue-700 p-3 rounded-xl text-white inline-block">
        {text}
      </div>
    </div>
  );
}
