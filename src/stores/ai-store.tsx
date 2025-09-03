import { getCapToken } from '@takeshape/use-cap';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

export type HistoryItem =
  | {
      type: 'llm';
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

export type AiProps = {};

export type AiState = {
  aiChatOpen: boolean;
  loading: boolean;
  inputText: string;
  inputRef: React.MutableRefObject<HTMLInputElement> | null;
  feedbackOpen: boolean;
  isPositive: boolean | null;
  selectedMessage: string | null;
  selectedMessageId: string | null;
  protectionToken: string | null;
  protectionInitialized: boolean;

  setAiChatOpen: (aiChatOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
  setInputText: (inputText: string) => void;
  setFeedbackClosed: () => void;
  setFeedbackOpen: (
    isPositive: boolean | null,
    messageId: string | null,
    message: string | null
  ) => void;
  initProtectionToken: (capEndpoint: string) => Promise<void>;
};

export const createAiStore = (initProps?: Partial<AiProps>) => {
  return createStore<AiState>()((set, get) => ({
    protectionInitialized: false,
    aiChatOpen: false,
    loading: false,
    inputText: '',
    inputRef: null,
    feedbackOpen: false,
    isPositive: null,
    selectedMessage: null,
    selectedMessageId: null,
    protectionToken: null,

    ...initProps,

    setAiChatOpen: (aiChatOpen) => {
      set({ aiChatOpen });
    },

    setLoading: (loading) => {
      set({ loading });
    },

    setInputText: (inputText) => {
      set({ inputText });
    },

    setFeedbackClosed: () => {
      set({
        feedbackOpen: false,
        isPositive: null,
        selectedMessageId: null,
        selectedMessage: null
      });
    },

    setFeedbackOpen: (isPositive, selectedMessageId, selectedMessage) => {
      set({
        feedbackOpen: true,
        isPositive,
        selectedMessageId,
        selectedMessage
      });
    },

    initProtectionToken: async (capEndpoint: string) => {
      const { protectionInitialized } = get();
      if (protectionInitialized) {
        return;
      }

      set({ loading: true, protectionInitialized: true });
      await getCapToken({
        endpoint: capEndpoint,
        refreshAutomatically: true,
        onSolve(token) {
          set({ protectionToken: token.token });
        }
      });
      set({ loading: false });
    }
  }));
};

export type AiStore = ReturnType<typeof createAiStore>;
type AiProviderProps = PropsWithChildren<AiProps>;

export const AiContext = createContext<AiStore | null>(null);

export function AiProvider({ children, ...props }: AiProviderProps) {
  const storeRef = useRef<AiStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = createAiStore(props);
  }
  return (
    <AiContext.Provider value={storeRef.current}>{children}</AiContext.Provider>
  );
}

export function useAiStore<T>(selector: (state: AiState) => T): T {
  const store = useContext(AiContext);
  if (!store) throw new Error('Missing AiContext.Provider in the tree');
  return useStore(store, selector);
}
