import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useApi } from '../../api';
import { Screen } from '../../ui/Screen';
import { AuthForm, type AuthValues } from './AuthForm';
import { authErrors, type AuthErrors, type AuthMode } from './authErrors';
import { useSession } from './session';

// Tokens are per device (ADR 0004); the name helps people recognise their devices later.
const FALLBACK_DEVICE_NAME = 'Lockmate app';

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const { client } = useApi();
  const { signIn } = useSession();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});

  async function submit({ name, email, password }: AuthValues) {
    setBusy(true);
    setErrors({});
    const deviceName = Constants.deviceName ?? FALLBACK_DEVICE_NAME;

    try {
      const { data, error, response } =
        mode === 'sign-in'
          ? await client.POST('/auth/login', { body: { email, password, device_name: deviceName } })
          : await client.POST('/auth/register', { body: { name, email, password, device_name: deviceName } });

      if (data) {
        // The route guard swaps to the signed-in screens once the session has a token.
        await signIn(data.data.token);
        return;
      }
      setErrors(authErrors(mode, response.status, error && 'errors' in error ? Object.keys(error.errors) : []));
    } catch {
      setErrors(authErrors(mode, null, []));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AuthForm
        mode={mode}
        busy={busy}
        errors={errors}
        onSubmit={(values) => void submit(values)}
        onSwitchMode={() => router.replace(mode === 'sign-in' ? '/sign-up' : '/sign-in')}
      />
    </Screen>
  );
}
