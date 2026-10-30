import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { requireSupabase } from '../../auth/supabase';
import { isAdmin, type MemberAccount } from '../../auth/account';
import { useAuth } from '../../state/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme';
import { AuthLayout, AuthLink, authStyles as s } from './AuthUI';

const PAGE_SIZE = 20;
export function RegistrationRequestsScreen({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<MemberAccount[]>([]);
  const [history, setHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState<{ id: string; decision: 'approved' | 'rejected' } | null>(null);
  const requestVersion = useRef(0);
  const inFlight = useRef(false);

  const load = useCallback(async (offset = 0) => {
    if (!isAdmin(currentUser)) return;
    const ticket = ++requestVersion.current;
    setBusy(true); setError('');
    try {
      let query = requireSupabase().from('member_accounts').select('*').eq('role', 'user');
      query = history ? query.neq('status', 'pending') : query.eq('status', 'pending');
      const { data, error: problem } = await query.order('created_at', { ascending: !history }).order('id').range(offset, offset + PAGE_SIZE);
      if (problem) throw problem;
      if (ticket !== requestVersion.current) return;
      const rows = (data ?? []) as MemberAccount[];
      setHasMore(rows.length > PAGE_SIZE);
      setRequests(prev => offset ? [...prev, ...rows.slice(0, PAGE_SIZE)] : rows.slice(0, PAGE_SIZE));
    } catch {
      if (ticket === requestVersion.current) setError('Could not load requests. Check your connection and refresh.');
    } finally { if (ticket === requestVersion.current) setBusy(false); }
  }, [currentUser?.id, currentUser?.role, currentUser?.status, history]);

  useEffect(() => { setRequests([]); setConfirmation(null); void load(); return () => { requestVersion.current += 1; }; }, [load]);

  async function review() {
    if (!confirmation || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(''); setNotice('');
    const { id, decision } = confirmation;
    try {
      const { error: problem } = await requireSupabase().rpc('review_registration', { target_user_id: id, decision });
      if (problem) throw problem;
      setConfirmation(null);
      setNotice(decision === 'approved' ? 'Request approved. This member can now open the app.' : 'Request declined. App access remains blocked.');
      await load();
    } catch { setError('Could not save the decision. Refresh to check whether this request was already reviewed, and verify the member confirmed their email.'); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return <AuthLayout title="Registration requests" subtitle="Review who can join. Approved members get their own training profile.">
    <AuthLink label="Back to profile" onPress={onClose} />
    {!isAdmin(currentUser) ? <Text style={s.body}>Admin access is required.</Text> : <>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}><PrimaryButton variant="outline" label={history ? 'Show pending' : 'Review history'} disabled={busy}
          onPress={() => { setHistory(!history); setNotice(''); }} /></View>
        <View style={{ flex: 1 }}><PrimaryButton variant="outline" label="Refresh" disabled={busy} onPress={() => void load()} /></View>
      </View>
      {!!notice && <Text accessibilityLiveRegion="polite" style={s.body}>{notice}</Text>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {busy && <ActivityIndicator color={colors.accentLight} accessibilityLabel="Loading requests" />}
      {!busy && !error && requests.length === 0 && <View style={s.notice}>
        <Text style={s.label}>{history ? 'No reviewed requests yet' : 'You’re all caught up'}</Text>
        <Text style={s.body}>{history ? 'Decisions will appear here after review.' : 'New registration requests will appear here.'}</Text>
      </View>}
      {requests.map(request => <View style={s.notice} key={request.id}>
        <Text style={s.label}>{request.display_name}</Text>
        <Text selectable style={s.body}>{request.email}</Text>
        <Text style={s.body}>{new Date(request.created_at).toLocaleDateString()} · {request.email_verified ? 'Email verified' : 'Awaiting email verification'}</Text>
        {!!request.request_message && <Text style={s.body}>{request.request_message}</Text>}
        {request.status !== 'pending' ? <Text style={s.label}>{request.status === 'approved' ? 'Approved' : 'Declined'}
          {request.reviewed_at ? ` · ${new Date(request.reviewed_at).toLocaleDateString()}` : ''}</Text> :
          confirmation?.id === request.id ? <>
            <Text style={s.label}>{confirmation.decision === 'approved' ? 'Approve' : 'Decline'} this request?</Text>
            <PrimaryButton label="Confirm decision" variant="white" disabled={busy} onPress={() => void review()} />
            <AuthLink label="Cancel" disabled={busy} onPress={() => setConfirmation(null)} />
          </> : <View style={{ gap: 10 }}>
            <PrimaryButton label="Approve request" variant="white" disabled={busy || !request.email_verified}
              onPress={() => setConfirmation({ id: request.id, decision: 'approved' })} />
            <PrimaryButton label="Decline request" variant="outline" disabled={busy}
              onPress={() => setConfirmation({ id: request.id, decision: 'rejected' })} />
          </View>}
      </View>)}
      {hasMore && <PrimaryButton label="Load more" variant="outline" disabled={busy} onPress={() => void load(requests.length)} />}
    </>}
  </AuthLayout>;
}
