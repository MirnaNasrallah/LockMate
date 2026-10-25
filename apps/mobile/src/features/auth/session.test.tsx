import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import type { ReactNode } from 'react';
import { SessionProvider, useSession } from './session';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);

async function renderSession(stored: string | null) {
  store.getItemAsync.mockResolvedValue(stored);
  const queryClient = new QueryClient();
  queryClient.setQueryData(['previous user'], 'cached');

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
  const { result } = await renderHook(() => useSession(), { wrapper });
  await waitFor(() => expect(result.current.ready).toBe(true));
  return { result, queryClient };
}

describe('SessionProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('picks up the token this device stored last time', async () => {
    const { result } = await renderSession('1|stored');

    expect(result.current.token).toBe('1|stored');
  });

  it('keeps a new token in secure storage and drops the previous person’s cached data', async () => {
    const { result, queryClient } = await renderSession(null);

    await act(() => result.current.signIn('2|new'));

    expect(store.setItemAsync).toHaveBeenCalledWith('lockmate.deviceToken', '2|new');
    expect(result.current.token).toBe('2|new');
    expect(queryClient.getQueryData(['previous user'])).toBeUndefined();
  });

  it('forgets the token on this device', async () => {
    const { result } = await renderSession('1|stored');

    await act(() => result.current.forget());

    expect(store.deleteItemAsync).toHaveBeenCalledWith('lockmate.deviceToken');
    expect(result.current.token).toBeNull();
  });
});
