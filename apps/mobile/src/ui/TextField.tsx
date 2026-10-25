import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useLocale } from '../locale';
import { Text } from './Text';
import { radius, size, space, textStyle, useColors } from './theme';

type Kind = 'name' | 'email' | 'password';

// Keyboard, autofill and capitalisation per kind, so password managers and autofill work.
const INPUT_BY_KIND: Record<Kind, TextInputProps> = {
  name: { autoComplete: 'name', textContentType: 'name', autoCapitalize: 'words' },
  email: {
    autoComplete: 'email',
    textContentType: 'emailAddress',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
  },
  password: { autoComplete: 'password', textContentType: 'password', secureTextEntry: true, autoCapitalize: 'none' },
};

// Emails and passwords are Latin even in Arabic, so they stay left to right.
const LATIN_ONLY: ReadonlySet<Kind> = new Set(['email', 'password']);

type Props = {
  kind: Kind;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | undefined;
};

/** A labelled input. Its border is line-strong (3:1), forest when focused and clay with an error. */
export function TextField({ kind, label, value, onChangeText, error }: Props) {
  const colors = useColors();
  const locale = useLocale();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.brand : colors.lineStrong;

  return (
    <View style={{ gap: space[2] }}>
      <Text variant="label">{label}</Text>
      <TextInput
        {...INPUT_BY_KIND[kind]}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.inkMuted}
        style={[
          textStyle('body', locale),
          {
            minHeight: size.touchTarget,
            paddingHorizontal: space[4],
            borderWidth: 1,
            borderColor,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
            color: colors.ink,
          },
          LATIN_ONLY.has(kind) && { writingDirection: 'ltr' },
        ]}
      />
      {error ? (
        <Text variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
