import { getCapToken } from '@takeshape/use-cap';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TakeShapeClient } from '../takeshape-client.ts';
import type { HistoryItem, Reference, ReferenceData } from '../types.ts';
import { useAiSession } from './use-ai-session';

const POLLING_INTERVAL = 100;
const POLLING_MAX_WAIT = 1000 * 60 * 5; // 5 minutes
const POLLING_MAX_ATTEMPTS = POLLING_MAX_WAIT / POLLING_INTERVAL;

export const CREATE_CHAT_SESSION = `#graphql
  mutation createChatSession {
    createChatSession {
      id
    }
  }
`;

export const SEND_CHAT_MESSAGE = `#graphql
  mutation sendChatMessage(
    $input: String!
    $sessionId: String!
    $token: String!
  ) {
    sendChatMessage(
      input: $input
      sessionId: $sessionId
      runMode: ALLOW_BACKGROUND
      token: $token
    ) {
      messageId
      session {
        id
        sessionMemory
      }
      output {
        content
        references {
          _tid
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGE = `#graphql
  query getChatMessage($messageId: String!) {
    getChatMessage(messageId: $messageId) {
      error {
        message
      }
      session {
        sessionMemory
      }
      output {
        content
        references {
          _tid
        }
      }
      status
    }
  }
`;

type SessionMemory = Record<string, unknown>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type MutationArgs = {
  client: TakeShapeClient;
  input: string;
  token: string;
  sessionId?: string;
  typeId?: number;
  typeName?: string;
};

const getMutationFn =
  (client: TakeShapeClient) => async (args: MutationArgs) => {
    const { input, token } = args;
    let sessionId = args.sessionId;

    if (!sessionId) {
      const createSessionResult = await client.mutation(CREATE_CHAT_SESSION);
      sessionId = createSessionResult.createChatSession?.id;
    }

    if (!sessionId) {
      throw new Error('No session ID');
    }

    const sendMessageResult = await client.mutation(SEND_CHAT_MESSAGE, {
      variables: {
        input,
        sessionId,
        token
      }
    });

    const messageId = sendMessageResult.sendChatMessage?.messageId;
    let output = sendMessageResult.sendChatMessage?.output;
    let sessionMemory = sendMessageResult.sendChatMessage?.session
      .sessionMemory as SessionMemory;

    if (!output) {
      let attempts = POLLING_MAX_ATTEMPTS;

      if (!messageId) {
        throw new Error('No message ID');
      }

      while (!output && attempts > 0) {
        await sleep(POLLING_INTERVAL);

        const getMessageResult = await client.query(GET_CHAT_MESSAGE, {
          variables: {
            messageId
          }
        });

        if (getMessageResult.getchatMessage?.error) {
          throw new Error(
            getMessageResult.getchatMessage.error.message ?? 'Unknown Error'
          );
        }

        if (getMessageResult.getchatMessage?.status === 'DONE') {
          output = getMessageResult.getchatMessage.output;
          sessionMemory = getMessageResult.getchatMessage.session
            ?.sessionMemory as SessionMemory;
        }
        attempts--;
      }
    }

    if (!output || !messageId) {
      throw new Error('Could not get chat response');
    }

    return {
      isStreamFinished: true,
      output,
      messageId,
      sessionId,
      sessionMemory
    };
  };

export const useAi = (client: TakeShapeClient, capEndpoint: string) => {
  // UI State
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  // Protection State
  const [protectionToken, setProtectionToken] = useState<string | null>(null);
  const [protectionInitialized, setProtectionInitialized] = useState(false);

  // Helper functions
  const setFeedbackClosed = useCallback(() => {
    setFeedbackOpen(false);
    setIsPositive(null);
    setSelectedMessageId(null);
    setSelectedMessage(null);
  }, []);

  const setFeedbackOpenWithData = useCallback(
    (positive: boolean, messageId: string, message: string) => {
      setFeedbackOpen(true);
      setIsPositive(positive);
      setSelectedMessageId(messageId);
      setSelectedMessage(message);
    },
    []
  );

  const initProtectionToken = useCallback(async () => {
    if (protectionInitialized) return;

    setLoading(true);
    setProtectionInitialized(true);
    await getCapToken({
      endpoint: capEndpoint,
      refreshAutomatically: true,
      onSolve(token) {
        setProtectionToken(token.token);
      }
    });
    setLoading(false);
  }, [capEndpoint, protectionInitialized]);
  const { session, setSession, resetSession } = useAiSession();

  const [error, setError] = useState<Error | null>(null);

  const { history, references, sessionId } = session ?? {};

  useEffect(() => {
    void initProtectionToken();
  }, [initProtectionToken]);

  const executeMutation = useCallback(
    async (args: MutationArgs) => {
      try {
        setError(null);
        const result = await getMutationFn(client)(args);

        if (result.output) {
          const newHistory: HistoryItem[] = [
            ...(history ?? []),
            {
              type: 'llm',
              value: result.output.content,
              messageId: result.messageId,
              isStreamFinished: result.isStreamFinished
            }
          ];

          const newReferences: Record<string, ReferenceData> = {
            ...references
          };

          result.output.references?.forEach((reference: Reference) => {
            newReferences[reference._tid] = reference.data;
          });

          setSession({
            history: newHistory,
            sessionId: result.sessionId,
            sessionMemory: result.sessionMemory,
            references: newReferences
          });
        }

        setLoading(false);
        setTimeout(() => {
          inputRef?.current?.focus();
        }, 0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    },
    [client, history, references, setSession]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    (message: string, newSession = false) => {
      if (!protectionToken) return;
      setLoading(true);
      const newHistory: HistoryItem[] = newSession ? [] : (history ?? []);
      newHistory.push({
        type: 'user',
        value: message
      });
      const newSessionId = newSession ? undefined : sessionId;
      setInputText('');
      setSession({ history: newHistory, sessionId: newSessionId ?? '' });
      void executeMutation({
        client,
        input: message,
        sessionId: newSessionId,
        token: protectionToken
      });
    },
    [protectionToken, history, sessionId, setSession, executeMutation, client]
  );

  const sendMessageQuietly = useCallback(
    async (params: Omit<MutationArgs, 'client' | 'token'>) => {
      if (protectionToken) {
        void executeMutation({ ...params, client, token: protectionToken });
      }
    },
    [protectionToken, executeMutation, client]
  );

  return {
    // Chat functionality
    sendMessage,
    session,
    setSession,
    resetSession,
    mutate: sendMessageQuietly,
    reset,
    error,

    // UI State
    aiChatOpen,
    setAiChatOpen,
    loading,
    setLoading,
    inputText,
    setInputText,
    inputRef,

    // Feedback State
    feedbackOpen,
    setFeedbackOpen: setFeedbackOpenWithData,
    setFeedbackClosed,
    isPositive,
    selectedMessage,
    selectedMessageId
  };
};

export type UseAi = ReturnType<typeof useAi>;
