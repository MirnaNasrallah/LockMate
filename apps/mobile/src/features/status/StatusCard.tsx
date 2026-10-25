import { useApi } from '../../api';
import { StatusCardView, type StatusState } from './StatusCardView';

/** Calls GET /api/v1/status through the generated client: the end-to-end check of the whole stack. */
export function StatusCard() {
  const { query } = useApi();
  const status = query.useQuery('get', '/status');

  const state: StatusState = status.data
    ? { kind: 'connected', locale: status.data.data.locale }
    : status.isError && !status.isFetching
      ? { kind: 'unreachable' }
      : { kind: 'checking' };

  return <StatusCardView state={state} onRetry={() => void status.refetch()} />;
}
