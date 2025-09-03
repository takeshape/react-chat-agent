import { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import type {
  TakeShapeClient,
  TakeShapeConnectionDetails
} from '../takeshape/client';
import { createTakeShapeClient } from '../takeshape/client';

export type TakeShapeProps = {
  endpoint: string;
  client: TakeShapeClient;
  email: string | null;
};

export type TakeShapeState = TakeShapeProps;

export type TakeShapeStore = ReturnType<typeof createTakeShapeStore>;

export const createTakeShapeStore = (initProps: TakeShapeProps) => {
  return createStore<TakeShapeState>()(() => ({
    ...initProps
  }));
};

type TakeShapeProviderProps =
  React.PropsWithChildren<TakeShapeConnectionDetails>;

export const TakeShapeContext = createContext<TakeShapeStore | null>(null);

export function TakeShapeProvider({
  children,
  ...connectionDetails
}: TakeShapeProviderProps) {
  const storeRef = useRef<TakeShapeStore>(undefined);

  if (!storeRef.current) {
    storeRef.current = createTakeShapeStore({
      endpoint: connectionDetails.endpoint,
      client: createTakeShapeClient(
        connectionDetails.endpoint,
        connectionDetails.apiKey
      ),
      email: connectionDetails.email ?? null
    });
  }

  return (
    <TakeShapeContext.Provider value={storeRef.current}>
      {children}
    </TakeShapeContext.Provider>
  );
}

export function useTakeShapeStore<T>(
  selector: (state: TakeShapeState) => T
): T {
  const store = useContext(TakeShapeContext);
  if (!store) {
    throw new Error('Missing TakeShapeContext.Provider in the tree');
  }

  return useStore(store, selector);
}
