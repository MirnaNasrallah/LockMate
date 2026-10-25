import { authErrors } from './authErrors';

describe('authErrors', () => {
  it('never tells someone signing in which part was wrong', () => {
    expect(authErrors('sign-in', 422, ['email'])).toEqual({ form: 'auth.signIn.failed' });
    expect(authErrors('sign-in', 422, ['password'])).toEqual({ form: 'auth.signIn.failed' });
  });

  it('points at each field the API rejected on sign-up, ignoring ones the form does not show', () => {
    expect(authErrors('sign-up', 422, ['email', 'password', 'device_name'])).toEqual({
      email: 'auth.error.email',
      password: 'auth.error.password',
    });
  });

  it('asks people to wait when rate-limited', () => {
    expect(authErrors('sign-up', 429, [])).toEqual({ form: 'auth.error.tooMany' });
  });

  it('blames the connection when there was no answer or the server failed', () => {
    expect(authErrors('sign-in', null, [])).toEqual({ form: 'auth.error.network' });
    expect(authErrors('sign-in', 500, [])).toEqual({ form: 'auth.error.network' });
  });
});
