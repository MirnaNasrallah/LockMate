import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ApiProvider } from '../api';
import { SessionProvider, useSession } from '../features/auth/session';
import { deviceLocale, LocaleProvider } from '../locale';
import { fontFiles } from '../ui/fonts';

// Keep the native splash up until Rubik and the stored session are ready, so the first frame is
// already on brand and on the right screen.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const [queryClient] = useState(() => new QueryClient());
  const [locale] = useState(deviceLocale);

  // If the fonts fail to load, carry on with the system font rather than a stuck splash.
  if (!fontsLoaded && fontError === null) {
    return null;
  }

  return (
    <LocaleProvider locale={locale}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ApiProvider>
            <StatusBar style="auto" />
            <Navigator />
          </ApiProvider>
        </SessionProvider>
      </QueryClientProvider>
    </LocaleProvider>
  );
}

/** Signed-in people get the app; everyone else gets sign-in and sign-up. */
function Navigator() {
  const { ready, token } = useSession();

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={token !== null}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={token === null}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
    </Stack>
  );
}
