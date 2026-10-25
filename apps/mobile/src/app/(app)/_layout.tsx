import { Stack } from 'expo-router';

/** Screens for signed-in people; the root layout only shows this group when there's a token. */
export default function SignedInLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
