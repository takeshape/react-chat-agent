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
}) {
  const { sendMessage } = props;

  return (
    <div className="bg-gray-100 p-2 rounded-lg">
      <p className="mb-2">You can ask questions like...</p>
      <ul className="list-disc pl-4">
        <Suggestion
          sendMessage={sendMessage}
          message="I'm looking for oil for my car"
        />
        <Suggestion
          sendMessage={sendMessage}
          message="I'm looking for wiper blades"
        />
      </ul>
    </div>
  );
}
