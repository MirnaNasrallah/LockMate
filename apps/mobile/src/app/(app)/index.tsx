import { View } from 'react-native';
import { useApi } from '../../api';
import { useSignOut } from '../../features/auth/useSignOut';
import { StatusCard } from '../../features/status/StatusCard';
import { useTranslate } from '../../locale';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { space } from '../../ui/theme';

export default function Home() {
  const t = useTranslate();
  const { query } = useApi();
  const me = query.useQuery('get', '/me');
  const signOut = useSignOut();

  return (
    <Screen>
      <View style={{ gap: space[2] }}>
        <Text variant="display" color="brand" accessibilityRole="header">
          {t('app.name')}
        </Text>
        <Text variant="title">{me.data ? t('home.greeting', { name: me.data.data.name }) : t('app.tagline')}</Text>
      </View>
      <StatusCard />
      <Button variant="quiet" label={t('auth.signOut')} onPress={() => void signOut()} />
    </Screen>
  );
}
