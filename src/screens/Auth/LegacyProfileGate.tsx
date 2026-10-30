import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { isAdmin, type MemberAccount } from '../../auth/account';
import { getDb } from '../../db/client';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import { AuthLayout, authStyles as s } from './AuthUI';

// Never silently attach device data to a newly registered account.
export function LegacyProfileGate({ account, children }: { account: MemberAccount; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [legacyId, setLegacyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { signOut } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (isAdmin(account)) {
          const db = await getDb();
          const existing = await db.getFirstAsync('SELECT user_id FROM user_data WHERE user_id = ?', account.id);
          const legacy = !existing ? await db.getFirstAsync<{ user_id: string }>(
            `SELECT d.user_id FROM user_data d JOIN users u ON d.user_id = u.id
             WHERE u.role = 'admin' AND substr(u.id, 1, 5) = 'user_' ORDER BY u.created_at LIMIT 1`
          ) : null;
          if (!cancelled) setLegacyId(legacy?.user_id ?? null);
        }
        if (!cancelled) { setReady(true); setError(''); }
      } catch { if (!cancelled) setError('Could not open your device data. Please try again.'); }
    })();
    return () => { cancelled = true; };
  }, [account.id, attempt]);

  async function importData() {
    if (!legacyId || busy || !isAdmin(account)) return;
    setBusy(true); setError('');
    try {
      const db = await getDb();
      await db.runAsync(
        `INSERT INTO user_data (user_id, data_json, updated_at)
         SELECT ?, data_json, ? FROM user_data WHERE user_id = ?
         ON CONFLICT(user_id) DO NOTHING`, [account.id, new Date().toISOString(), legacyId]
      );
      setLegacyId(null);
    } catch { setError('Import failed. Your original data is still on this device. Please retry.'); }
    finally { setBusy(false); }
  }

  if (!ready && !error) return <ActivityIndicator color={colors.accentLight} accessibilityLabel="Opening profile" />;
  if (ready && !legacyId) return <>{children}</>;
  return <AuthLayout title={legacyId ? 'Keep your training history' : 'Unable to open profile'}
    subtitle={legacyId ? 'The previous local Admin profile is still on this device. You can copy it to your signed-in admin account.' : 'Your saved data has not been changed.'}>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {legacyId ? <>
      <PrimaryButton label={busy ? 'Importing…' : 'Import existing Admin profile'} variant="white" disabled={busy} onPress={() => void importData()} />
      <PrimaryButton label="Start a new profile" variant="outline" disabled={busy} onPress={() => setLegacyId(null)} />
      <Text style={s.body}>The original profile is kept on this device. Workout history is not uploaded.</Text>
    </> : <PrimaryButton label="Retry" variant="white" onPress={() => { setError(''); setAttempt(n => n + 1); }} />}
    <PrimaryButton label="Sign out" variant="outline" disabled={busy} onPress={() => {
      void signOut().catch(() => setError('Could not sign out. Please retry.'));
    }} />
  </AuthLayout>;
}
