import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

// The device token is a password: Keychain / Keystore only, never plain storage (ADR 0004).
const TOKEN_KEY = 'lockmate.deviceToken';

export type Session = {
  /** False until the stored token has been read, so the app never flashes the sign-in screen. */
  ready: boolean;
  token: string | null;
  signIn: (token: string) => Promise<void>;
  /** Forgets the token on this device. To revoke it on the server too, use useSignOut(). */
  forget: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then(setToken, () => setToken(null))
      .finally(() => setReady(true));
  }, []);

  // Cached answers belong to whoever was signed in, so they go whenever that changes.
  const signIn = useCallback(
    async (newToken: string) => {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      queryClient.clear();
      setToken(newToken);
    },
    [queryClient],
  );

  const forget = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    queryClient.clear();
    setToken(null);
  }, [queryClient]);

  const session = useMemo(() => ({ ready, token, signIn, forget }), [ready, token, signIn, forget]);

  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = use(SessionContext);
  if (session === null) {
    throw new Error('useSession() needs a <SessionProvider> above it');
  }
  return session;
}
