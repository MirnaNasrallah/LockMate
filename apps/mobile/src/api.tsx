import { createApiClient } from '@lockmate/api-client';
import createQueryHooks from 'openapi-react-query';
import { createContext, use, useMemo, type ReactNode } from 'react';
import { useSession } from './features/auth/session';
import { useLocale } from './locale';

function apiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error('EXPO_PUBLIC_API_URL is not set: copy apps/mobile/.env.example to apps/mobile/.env');
  }
  return url;
}

const baseUrl = apiBaseUrl();

function createApi(options: Omit<Parameters<typeof createApiClient>[0], 'baseUrl'>) {
  const client = createApiClient({ baseUrl, ...options });
  return { client, query: createQueryHooks(client) };
}

/**
 * `client` for one-off calls (`client.POST('/auth/login', …)`), `query` for TanStack Query hooks
 * (`query.useQuery('get', '/me')`). Both are typed from the API spec.
 */
export type Api = ReturnType<typeof createApi>;

const ApiContext = createContext<Api | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { token, forget } = useSession();

  const api = useMemo(
    () =>
      createApi({
        locale: () => locale,
        token: () => token,
        // The token expired or was revoked elsewhere: back to sign-in.
        onUnauthorized: () => void forget(),
      }),
    [locale, token, forget],
  );

  return <ApiContext value={api}>{children}</ApiContext>;
}

export function useApi(): Api {
  const api = use(ApiContext);
  if (api === null) {
    throw new Error('useApi() needs an <ApiProvider> above it');
  }
  return api;
}
