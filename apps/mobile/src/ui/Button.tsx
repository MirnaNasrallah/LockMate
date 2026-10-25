import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from './Text';
import { radius, size, space, useColors } from './theme';

const PRESSED_OPACITY = 0.8;

type Props = {
  label: string;
  onPress: () => void;
  /** primary: the one forest pill per screen. quiet: a forest text action, still touch-target sized. */
  variant?: 'primary' | 'quiet';
  /** Shows progress and ignores presses, e.g. while a request is in flight. */
  busy?: boolean;
};

export function Button({ label, onPress, variant = 'primary', busy = false }: Props) {
  const colors = useColors();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: primary ? 'stretch' : 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size.touchTarget,
        minWidth: size.touchTarget,
        paddingHorizontal: primary ? space[6] : 0,
        borderRadius: radius.full,
        backgroundColor: primary ? colors.brand : 'transparent',
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        {busy ? <ActivityIndicator color={primary ? colors.onBrand : colors.brand} /> : null}
        <Text variant="label" color={primary ? 'onBrand' : 'brand'}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
