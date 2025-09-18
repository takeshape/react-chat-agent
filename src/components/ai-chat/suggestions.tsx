function Suggestion(props: {
  message: string;
  sendMessage: (message: string) => void;
}) {
  const { message, sendMessage } = props;
  return (
    <button
      type="button"
      className="text-blue-600 hover:underline cursor-pointer"
      onClick={() => {
        sendMessage(message);
      }}
    >
      {message}
    </button>
  );
}

export default function Suggestions(props: {
  sendMessage: (message: string) => void;
  suggestions?: string[];
}) {
  const { sendMessage, suggestions } = props;
  if (!suggestions?.length) {
    return null;
  }

  return (
    <div className="bg-gray-100 p-2 rounded-lg">
      <p className="mb-2">You can ask questions like...</p>
      <ul className="list-disc pl-4">
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <Suggestion sendMessage={sendMessage} message={suggestion} />
          </li>
        ))}
      </ul>
    </div>
  );
}
