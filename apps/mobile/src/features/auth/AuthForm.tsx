import { useState } from 'react';
import { View } from 'react-native';
import { useTranslate } from '../../locale';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { space } from '../../ui/theme';
import type { AuthErrors, AuthMode } from './authErrors';

export type AuthValues = { name: string; email: string; password: string };

type Props = {
  mode: AuthMode;
  busy: boolean;
  errors: AuthErrors;
  onSubmit: (values: AuthValues) => void;
  onSwitchMode: () => void;
};

const COPY = {
  'sign-in': { title: 'auth.signIn.title', submit: 'auth.signIn.submit', switch: 'auth.signIn.switch' },
  'sign-up': { title: 'auth.signUp.title', submit: 'auth.signUp.submit', switch: 'auth.signUp.switch' },
} as const;

/** Sign-in and sign-up share one form; sign-up adds the name field. */
export function AuthForm({ mode, busy, errors, onSubmit, onSwitchMode }: Props) {
  const t = useTranslate();
  const [values, setValues] = useState<AuthValues>({ name: '', email: '', password: '' });
  const set = (field: keyof AuthValues) => (text: string) => setValues((current) => ({ ...current, [field]: text }));
  const error = (field: keyof AuthErrors) => {
    const key = errors[field];
    return key ? t(key) : undefined;
  };

  return (
    <View style={{ gap: space[6] }}>
      <Text variant="title" accessibilityRole="header">
        {t(COPY[mode].title)}
      </Text>

      {mode === 'sign-up' ? (
        <TextField
          kind="name"
          label={t('auth.field.name')}
          value={values.name}
          onChangeText={set('name')}
          error={error('name')}
        />
      ) : null}
      <TextField
        kind="email"
        label={t('auth.field.email')}
        value={values.email}
        onChangeText={set('email')}
        error={error('email')}
      />
      <TextField
        kind="password"
        label={t('auth.field.password')}
        value={values.password}
        onChangeText={set('password')}
        error={error('password')}
      />

      {errors.form ? (
        <Text color="danger" accessibilityRole="alert">
          {t(errors.form)}
        </Text>
      ) : null}

      <View style={{ gap: space[2] }}>
        <Button label={t(COPY[mode].submit)} busy={busy} onPress={() => onSubmit(values)} />
        <Button variant="quiet" label={t(COPY[mode].switch)} onPress={onSwitchMode} />
      </View>
    </View>
  );
}
