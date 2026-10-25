import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { space, useColors } from './theme';

/** A full screen on the dew background, with the brand's 24 px gutter and 40 px between sections. */
export function Screen({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space[6], gap: space[10] }}
        // Buttons get the tap while the keyboard is up (otherwise the first tap only closes it),
        // and content scrolls clear of the keyboard instead of hiding behind it.
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
