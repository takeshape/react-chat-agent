import { useCallback, useEffect, useState } from 'react';
import { useAiStore } from '../stores/ai-store';
import { useTakeShapeStore } from '../stores/takeshape-client-store';
import type { TakeShapeClient } from '../takeshape/client';
import {
  CREATE_CHAT_SESSION,
  GET_CHAT_MESSAGE,
  SEND_CHAT_MESSAGE
} from '../takeshape/queries';
import { type HistoryItem, useAiSession } from './use-ai-session';

const POLLING_INTERVAL = 100;
const POLLING_MAX_WAIT = 1000 * 60 * 5; // 5 minutes
const POLLING_MAX_ATTEMPTS = POLLING_MAX_WAIT / POLLING_INTERVAL;

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
            getMessageResult.getchatMessage.error.message ??
              'Unknown Error'
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

export const useAi = () => {
  const client = useTakeShapeStore((state) => state.client);
  const capEndpoint = useTakeShapeStore(
    (state) => `${new URL(state.endpoint).origin}/protection/cap/`
  );
  const setLoading = useAiStore((state) => state.setLoading);
  const setInputText = useAiStore((state) => state.setInputText);
  const inputRef = useAiStore((state) => state.inputRef);
  const protectionToken = useAiStore((state) => state.protectionToken);
  const initProtectionToken = useAiStore((state) => state.initProtectionToken);
  const { session, setSession, resetSession } = useAiSession();

  const [error, setError] = useState<Error | null>(null);

  const { history = [], sessionId } = session ?? {};

  useEffect(() => {
    void initProtectionToken(capEndpoint);
  }, [capEndpoint, initProtectionToken]);

  const executeMutation = useCallback(
    async (args: MutationArgs) => {
      try {
        setError(null);
        const result = await getMutationFn(client)(args);

        if (result.output) {
          const newHistory: HistoryItem[] = [
            ...history,
            {
              type: 'llm',
              value: result.output.content,
              messageId: result.messageId,
              isStreamFinished: result.isStreamFinished
            }
          ];

          setSession({
            history: newHistory,
            sessionId: result.sessionId
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
    [client, history, setSession, setLoading, inputRef]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    (message: string, newSession = false) => {
      if (!protectionToken) return;
      setLoading(true);
      const newHistory: HistoryItem[] = newSession ? [] : history;
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
    [
      protectionToken,
      setLoading,
      history,
      sessionId,
      setInputText,
      setSession,
      executeMutation,
      client
    ]
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
    sendMessage,
    session,
    setSession,
    resetSession,
    mutate: sendMessageQuietly,
    reset,
    error
  };
};
