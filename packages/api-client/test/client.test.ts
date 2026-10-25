import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApiClient, type Locale } from '../src/index.ts';

const BASE_URL = 'https://api.example.test/api/v1';

// Answers like the real status endpoint and remembers every request it saw.
function fakeApi() {
  const requests: Request[] = [];
  const fetch = async (request: Request) => {
    requests.push(request);
    return Response.json({ data: { status: 'ok', locale: request.headers.get('Accept-Language') } });
  };
  return { requests, fetch };
}

describe('createApiClient', () => {
  it('calls paths from the spec under the versioned base URL', async () => {
    const api = fakeApi();
    const client = createApiClient({ baseUrl: BASE_URL, locale: () => 'en', fetch: api.fetch });

    const { data } = await client.GET('/status');

    assert.equal(api.requests[0]?.url, `${BASE_URL}/status`);
    assert.deepEqual(data, { data: { status: 'ok', locale: 'en' } });
  });

  it('sends the current language with every request', async () => {
    const api = fakeApi();
    let locale: Locale = 'en';
    const client = createApiClient({ baseUrl: BASE_URL, locale: () => locale, fetch: api.fetch });

    await client.GET('/status');
    locale = 'ar';
    await client.GET('/status');

    assert.deepEqual(
      api.requests.map((request) => request.headers.get('Accept-Language')),
      ['en', 'ar'],
    );
  });

  it('sends the device token while signed in, and nothing once signed out', async () => {
    const api = fakeApi();
    let token: string | null = '1|abc';
    const client = createApiClient({ baseUrl: BASE_URL, locale: () => 'en', token: () => token, fetch: api.fetch });

    await client.GET('/me');
    token = null;
    await client.GET('/me');

    assert.deepEqual(
      api.requests.map((request) => request.headers.get('Authorization')),
      ['Bearer 1|abc', null],
    );
  });

  it('reports a rejected token, but not a 401 for a request that had none', async () => {
    let rejections = 0;
    let token: string | null = '1|expired';
    const client = createApiClient({
      baseUrl: BASE_URL,
      locale: () => 'en',
      token: () => token,
      onUnauthorized: () => rejections++,
      fetch: async () => Response.json({ message: 'Unauthenticated.' }, { status: 401 }),
    });

    await client.GET('/me');
    token = null;
    await client.GET('/me');

    assert.equal(rejections, 1);
  });

  // On phones, Expo's fetch returns its own response class, not the global Response. The
  // middleware must only watch responses: returning one makes openapi-fetch check `instanceof
  // Response`, which fails there and turned every answer into a thrown error.
  it("works with a fetch whose responses aren't the global Response class", async () => {
    const foreignResponse = {
      status: 422,
      ok: false,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ message: 'Invalid.', errors: { password: ['Too short.'] } }),
    } as unknown as Response;
    const client = createApiClient({
      baseUrl: BASE_URL,
      locale: () => 'en',
      token: () => '1|abc',
      onUnauthorized: () => undefined,
      fetch: async () => foreignResponse,
    });

    const { error, response } = await client.POST('/auth/login', {
      body: { email: 'salma@example.test', password: 'short', device_name: 'iPhone' },
    });

    assert.equal(response.status, 422);
    assert.deepEqual(error, { message: 'Invalid.', errors: { password: ['Too short.'] } });
  });
});
