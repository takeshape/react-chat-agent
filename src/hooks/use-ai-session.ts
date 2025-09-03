import { useEffect, useMemo, useSyncExternalStore } from 'react';

export type HistoryItem =
  | {
      type: 'llm';
      messageId: string;
      value: string;
      isStreamFinished?: boolean;
    }
  | {
      type: 'user';
      value: string;
    };

export type ChatSession = {
  history: HistoryItem[];
  sessionId?: string;
  expires?: number;
};

const SESSION_KEY = 'ai-chat-session';

function getExpires() {
  return Date.now() + 1000 * 60 * 60 * 24;
}

function setSession(session: ChatSession) {
  const json = JSON.stringify({ ...session, expires: getExpires() });
  window.localStorage.setItem(SESSION_KEY, json);
  window.dispatchEvent(
    new StorageEvent('storage', { key: SESSION_KEY, newValue: json })
  );
}

function resetSession() {
  setSession({ history: [] });
}

function getSnapshot() {
  return window.localStorage.getItem(SESSION_KEY);
}

function parseSession(
  json: string | null | undefined
): ChatSession | undefined {
  try {
    return json ? (JSON.parse(json) as ChatSession) : undefined;
  } catch {}
}

function subscribe(listener: () => void) {
  window.addEventListener('storage', listener);
  return () => void window.removeEventListener('storage', listener);
}

export function useAiSession() {
  // server-side getSnapshot returns null so we handle on client-side
  const json = useSyncExternalStore(subscribe, getSnapshot, () => undefined);
  const session = useMemo(() => parseSession(json), [json]);

  useEffect(() => {
    if (session?.expires && Date.now() > session?.expires) {
      resetSession();
    }
  }, [session]);

  return { session, setSession, resetSession } as const;
}
