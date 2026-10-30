import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { authConfigured, requireSupabase, supabase } from '../auth/supabase';
import { canAccessApp, type MemberAccount } from '../auth/account';
import { initDb } from '../db/client';
import { cacheSignedInUser } from '../db/usersRepo';

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  currentUser: MemberAccount | null;
  accountError: string | null;
  refreshing: boolean;
  recovery: boolean;
  refreshAccount: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  requestAccess: (name: string, email: string, password: string, message: string) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyRecovery: (email: string, token: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function emailRedirectTo() {
  return Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : 'fitnessapp-yriwgdjdxpppgufyhyrk://auth';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!authConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<MemberAccount | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const activeId = useRef<string | null>(null);
  const revision = useRef(0);

  useEffect(() => {
    if (!supabase) return;
    // Do not await other Auth calls inside this callback: it runs under the SDK lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      const id = next?.user.id ?? null;
      if (activeId.current !== id) {
        activeId.current = id;
        revision.current += 1;
        setCurrentUser(null);
        setAccountError(null);
      }
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (!next) setRecovery(false);
      setSession(next);
      setReady(true);
    });
    return () => { subscription.unsubscribe(); revision.current += 1; };
  }, []);

  useEffect(() => {
    if (!supabase || Platform.OS === 'web') return;
    const client = supabase;
    const handleLink = (url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'fitnessapp-yriwgdjdxpppgufyhyrk:' || parsed.hostname !== 'auth') return;
        const params = new URLSearchParams(parsed.hash.slice(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (!accessToken || !refreshToken) return;
        void client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) throw error;
            if (params.get('type') === 'recovery') setRecovery(true);
          })
          .catch(() => setAccountError('The email link could not be opened. Request a new one and try again.'));
      } catch { setAccountError('The email link could not be opened. Request a new one and try again.'); }
    };
    const subscription = Linking.addEventListener('url', event => handleLink(event.url));
    void Linking.getInitialURL().then(url => { if (url) handleLink(url); });
    return () => subscription.remove();
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!supabase || !activeId.current) return;
    const expectedId = activeId.current;
    const ticket = ++revision.current;
    setRefreshing(true);
    try {
      // Validate the session remotely before trusting cached identity or access.
      const { data: identity, error: identityError } = await supabase.auth.getUser();
      if (identityError || identity.user?.id !== expectedId) throw new Error('Please sign out and sign in again.');
      const { data, error } = await supabase.from('member_accounts').select('*').eq('id', expectedId).single();
      if (error || !data) throw new Error('We could not check your access. Check your connection and try again.');
      if (ticket !== revision.current || activeId.current !== expectedId) return;
      const account = data as MemberAccount;
      if (canAccessApp(account)) {
        await initDb();
        await cacheSignedInUser(account.id, account.display_name, account.role, account.created_at);
      }
      if (ticket !== revision.current || activeId.current !== expectedId) return;
      setCurrentUser(account);
      setAccountError(null);
    } catch (error) {
      if (ticket !== revision.current || activeId.current !== expectedId) return;
      setCurrentUser(null);
      setAccountError(error instanceof Error ? error.message : 'Could not check your access. Please retry.');
    } finally {
      if (ticket === revision.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;
    void refreshAccount();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refreshAccount(); }, 60000);
    const listener = AppState.addEventListener('change', (state) => {
      if (Platform.OS !== 'web') {
        if (state === 'active') supabase?.auth.startAutoRefresh();
        else supabase?.auth.stopAutoRefresh();
      }
      if (state === 'active') void refreshAccount();
    });
    return () => { clearInterval(timer); listener.remove(); };
  }, [session?.user.id, refreshAccount]);

  const value: AuthContextValue = {
    ready, configured: authConfigured, session, currentUser, accountError, refreshing, recovery, refreshAccount,
    async signIn(email, password) {
      const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
    },
    async requestAccess(name, email, password, message) {
      const { error } = await requireSupabase().auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { emailRedirectTo: emailRedirectTo(), data: { display_name: name.trim(), request_message: message.trim() } },
      });
      if (error) throw error;
    },
    async verifyEmail(email, token) {
      const { error } = await requireSupabase().auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: 'signup' });
      if (error) throw error;
    },
    async resendVerification(email) {
      const { error } = await requireSupabase().auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: emailRedirectTo() } });
      if (error) throw error;
    },
    async sendPasswordReset(email) {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: emailRedirectTo() });
      if (error) throw error;
    },
    async verifyRecovery(email, token) {
      setRecovery(true);
      const { error } = await requireSupabase().auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: 'recovery' });
      if (error) { setRecovery(false); throw error; }
    },
    async updatePassword(password) {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) throw error;
      setRecovery(false);
    },
    async signOut() {
      const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
      if (error) throw error;
      revision.current += 1;
      activeId.current = null;
      setCurrentUser(null);
      setSession(null);
      setAccountError(null);
      setRecovery(false);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
