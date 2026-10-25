import type { MessageKey } from '@lockmate/i18n';

export type AuthMode = 'sign-in' | 'sign-up';
export type AuthField = 'name' | 'email' | 'password';
export type AuthErrors = Partial<Record<AuthField | 'form', MessageKey>>;

const UNPROCESSABLE = 422;
const TOO_MANY_REQUESTS = 429;

// The API's own messages are English only for now, so fields map to the app's strings instead.
const FIELD_ERRORS: Record<AuthField, MessageKey> = {
  name: 'auth.error.name',
  email: 'auth.error.email',
  password: 'auth.error.password',
};

function isAuthField(field: string): field is AuthField {
  return Object.hasOwn(FIELD_ERRORS, field);
}

/**
 * What to tell the person after a failed request.
 *
 * @param status  the HTTP status, or null when the request never got an answer
 * @param fields  the fields the API's validation errors named
 */
export function authErrors(mode: AuthMode, status: number | null, fields: readonly string[]): AuthErrors {
  if (status === TOO_MANY_REQUESTS) {
    return { form: 'auth.error.tooMany' };
  }
  if (status !== UNPROCESSABLE) {
    return { form: 'auth.error.network' };
  }
  // Sign-in never says which part was wrong, so it can't reveal who has an account.
  if (mode === 'sign-in') {
    return { form: 'auth.signIn.failed' };
  }
  return Object.fromEntries(fields.filter(isAuthField).map((field) => [field, FIELD_ERRORS[field]]));
}
