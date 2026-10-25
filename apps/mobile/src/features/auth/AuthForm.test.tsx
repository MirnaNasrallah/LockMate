import type { Locale } from '@lockmate/i18n';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { LocaleProvider } from '../../locale';
import { AuthForm } from './AuthForm';
import type { AuthErrors, AuthMode } from './authErrors';

async function renderForm(locale: Locale, mode: AuthMode, errors: AuthErrors = {}) {
  const onSubmit = jest.fn();
  const onSwitchMode = jest.fn();
  await render(
    <LocaleProvider locale={locale}>
      <AuthForm mode={mode} busy={false} errors={errors} onSubmit={onSubmit} onSwitchMode={onSwitchMode} />
    </LocaleProvider>,
  );
  return { onSubmit, onSwitchMode };
}

describe('AuthForm', () => {
  it('signs in with an email and password only', async () => {
    const { onSubmit } = await renderForm('en', 'sign-in');

    expect(screen.queryByLabelText('Name')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Email'), 'salma@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'a long passphrase');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: '', email: 'salma@example.com', password: 'a long passphrase' });
  });

  it('asks for a name when signing up, in Arabic', async () => {
    const { onSubmit } = await renderForm('ar', 'sign-up');

    await fireEvent.changeText(screen.getByLabelText('الاسم'), 'سلمى');
    await fireEvent.press(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'سلمى' }));
  });

  it('shows field and form errors in the person’s language', async () => {
    await renderForm('ar', 'sign-up', { email: 'auth.error.email', form: 'auth.error.tooMany' });

    expect(screen.getByText('استخدم بريداً إلكترونياً صحيحاً وغير مسجّل من قبل.')).toBeOnTheScreen();
    expect(screen.getByText('محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.')).toBeOnTheScreen();
  });

  it('switches between signing in and signing up', async () => {
    const { onSwitchMode } = await renderForm('en', 'sign-in');

    await fireEvent.press(screen.getByRole('button', { name: 'New here? Create an account' }));

    expect(onSwitchMode).toHaveBeenCalledTimes(1);
  });
});
