import createClient from 'openapi-fetch';
import type { components, paths } from './schema.generated.ts';

export type { components, paths };

/** The languages the API answers in, straight from the spec (en, ar). */
export type Locale = components['schemas']['Locale'];

const UNAUTHORIZED = 401;

export type ApiClientOptions = {
  /** API origin plus version, e.g. "https://api.example.com/api/v1". */
  baseUrl: string;
  /** Read on every request, so switching language applies to the next call. */
  locale: () => Locale;
  /** The signed-in device's token (ADR 0004), read on every request; null when signed out. */
  token?: () => string | null;
  /** Called when the API rejects the token (expired or revoked), so the app can sign out. */
  onUnauthorized?: () => void;
  /** Swap the transport, e.g. in tests. */
  fetch?: (request: Request) => Promise<Response>;
};

// The only way the apps talk to the API (RULES §3). Every request carries the
// user's language because the API answers in it (ADR 0002).
export function createApiClient({ baseUrl, locale, token, onUnauthorized, fetch }: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl, ...(fetch === undefined ? {} : { fetch }) });

  client.use({
    onRequest({ request }) {
      request.headers.set('Accept-Language', locale());
      const bearer = token?.();
      if (bearer) {
        request.headers.set('Authorization', `Bearer ${bearer}`);
      }
      return request;
    },
    // Watches only: returning the response would make openapi-fetch check `instanceof Response`,
    // which fails with the fetch Expo installs on phones.
    onResponse({ request, response }) {
      if (response.status === UNAUTHORIZED && request.headers.has('Authorization')) {
        onUnauthorized?.();
      }
    },
  });

  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;
