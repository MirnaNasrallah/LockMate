import { useApi } from '../../api';
import { useSession } from './session';

/** Revokes this device's token on the server, then forgets it here, even if the server can't be reached. */
export function useSignOut() {
  const { client } = useApi();
  const { forget } = useSession();

  return async () => {
    try {
      await client.POST('/auth/logout');
    } finally {
      await forget();
    }
  };
}
