import { type JSX, useCallback, useState } from 'react';
import type { TakeShapeClient } from '../../takeshape/client';
import { FEEDBACK_MUTATION } from '../../takeshape/queries';

export type FeedbackProps = {
  client: TakeShapeClient;
  email: string | null;
  setFeedbackClosed: () => void;
  selectedMessageId: string | null;
  selectedMessage: string | null;
  isPositive: boolean | null;
};

/**
 * AI Chat Feedback Widget
 */
export function Feedback({
  client,
  email,
  setFeedbackClosed,
  selectedMessageId,
  selectedMessage,
  isPositive
}: FeedbackProps) {
  const [userMessage, setUserMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async () => {
    if (!selectedMessageId) return;

    setIsPending(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const variables: Record<string, unknown> = {
        messageId: selectedMessageId,
        name: 'Feedback',
        label: isPositive ? 'thumbs up' : 'thumbs down',
        note: userMessage,
        createdAt: Date.now() / 1000
      };

      if (email) {
        variables.updatedBy = email;
      }

      await client.mutation(FEEDBACK_MUTATION, { variables });
      setIsSuccess(true);
    } catch (_error) {
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  }, [userMessage, client, selectedMessageId, isPositive, email]);

  let content: JSX.Element;
  if (isPending) {
    content = <div>Submitting...</div>;
  } else if (isSuccess) {
    content = (
      <div>
        Success. Thank you for your feedback.
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={setFeedbackClosed}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    );
  } else if (isError) {
    content = (
      <div>
        There has been an error. Please try again later.
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={setFeedbackClosed}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
      >
        <div className="mb-4">
          <textarea
            name="feedback"
            required
            rows={4}
            className="mt-1 w-full p-1 border-1"
            value={userMessage}
            onChange={(e) => {
              setUserMessage(e.target.value);
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={setFeedbackClosed}
            className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="overlay expanded left-0 right-0 top-0 bottom-0 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">AI Chat Feedback</h2>
        {selectedMessage && !isSuccess && (
          <div className="my-4 space-y-2">
            <div>
              Giving{' '}
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? 'positive' : 'negative'}
              </span>{' '}
              feedback on this message:
            </div>
            <div className="pl-4 border-l-2 border-gray-300 max-h-24 overflow-scroll">
              {selectedMessage}
            </div>
          </div>
        )}
        {content}
      </div>
    </div>
  );
}
