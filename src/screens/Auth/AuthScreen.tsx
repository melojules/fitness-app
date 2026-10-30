import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../state/AuthContext';
import { validateCredentials } from '../../auth/account';
import { AuthField, AuthLayout, AuthLink, authStyles as s, authErrorMessage } from './AuthUI';

type Mode = 'login' | 'request' | 'verify' | 'forgot' | 'resetSent' | 'password';
const copy: Record<Mode, [string, string]> = {
  login: ['Welcome back', 'Sign in to your training profile.'],
  request: ['Request access', 'Create your account, verify your email, then wait for admin approval.'],
  verify: ['Check your email', 'Open the confirmation link in your email, then sign in. If your email has a code instead, enter it below.'],
  forgot: ['Reset your password', 'We’ll send a reset link to your email if an account exists.'],
  resetSent: ['Check your email', 'If an account exists for this address, open the password-reset link in your inbox to choose a new password. No code is needed. Check Spam or Junk too. If nothing arrives, contact the app admin.'],
  password: ['Choose a new password', 'Use at least 12 characters. Your approval status stays the same.'],
};

export function AuthScreen({ resetPassword = false }: { resetPassword?: boolean }) {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(resetPassword ? 'password' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'token', string>>>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [title, subtitle] = copy[mode];

  function go(next: Mode) { setMode(next); setError(''); setFieldErrors({}); setNotice(''); setPassword(''); setConfirm(''); setToken(''); }

  async function run(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(authErrorMessage(e)); }
    finally { busyRef.current = false; setBusy(false); }
  }

  function submit() {
    if (!auth.configured || busyRef.current) return;
    const problems: typeof fieldErrors = {};
    if (mode !== 'password') {
      const emailIssue = validateCredentials(email, 'unused');
      if (emailIssue) problems.email = emailIssue;
    }
    if (mode === 'login' && !password) problems.password = 'Enter your password.';
    if (mode === 'request' && !name.trim()) problems.name = 'Enter your name.';
    if (mode === 'request' || mode === 'password') {
      if (password.length < 12) problems.password = 'Use at least 12 characters for your password.';
      if (password !== confirm) problems.confirm = 'The passwords do not match.';
    }
    if (mode === 'verify' && token.trim() && !/^\d{6,10}$/.test(token.trim())) problems.token = 'Enter the code from your email.';
    setFieldErrors(problems);
    if (Object.keys(problems).length) { setError('Please correct the highlighted fields above.'); return; }
    void run(async () => {
      if (mode === 'login') await auth.signIn(email, password);
      if (mode === 'request') {
        await auth.requestAccess(name, email, password, message);
        go('verify');
        setNotice('If this email is eligible, a confirmation link is on its way. Existing members can sign in.');
      }
      if (mode === 'verify') {
        if (token.trim()) await auth.verifyEmail(email, token);
        else go('login');
      }
      if (mode === 'forgot') { await auth.sendPasswordReset(email); go('resetSent'); }
      if (mode === 'password') await auth.updatePassword(password);
    });
  }

  const actionLabel = { login: 'Sign in', request: 'Send registration request', verify: token.trim() ? 'Verify email code' : 'Back to sign in',
    forgot: 'Send reset link', resetSent: '', password: 'Save new password' }[mode];

  return <AuthLayout title={title} subtitle={subtitle}>
    {!auth.configured && <View style={s.notice}>
      <Text style={s.label}>Online accounts are not connected yet</Text>
      <Text style={s.body}>Sign-in and registration will be available once the app owner finishes account setup. Existing workout data is still on this device.</Text>
    </View>}
    <View style={s.form}>
      {mode === 'request' && <AuthField label="Your name" error={fieldErrors.name} value={name} onChangeText={setName} maxLength={80}
        autoComplete="name" editable={!busy} />}
      {mode !== 'password' && mode !== 'resetSent' && <AuthField label="Email address" error={fieldErrors.email} value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} editable={!busy} />}
      {(mode === 'login' || mode === 'request' || mode === 'password') && <AuthField label={mode === 'password' ? 'New password' : 'Password'}
        error={fieldErrors.password} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'} editable={!busy}
        returnKeyType={mode === 'login' ? 'go' : 'next'} onSubmitEditing={mode === 'login' ? submit : undefined} />}
      {(mode === 'request' || mode === 'password') && <>
        <Text style={s.body}>At least 12 characters. Password managers and paste are supported.</Text>
        <AuthField label="Confirm password" error={fieldErrors.confirm} value={confirm} onChangeText={setConfirm} secureTextEntry
          autoCapitalize="none" autoComplete="new-password" editable={!busy} />
      </>}
      {mode === 'request' && <AuthField label="Message to admin (optional)" value={message} onChangeText={setMessage}
        placeholder="Tell us a little about your training goals" multiline maxLength={1000} editable={!busy} />}
      {mode === 'verify' && <AuthField label="Email code" error={fieldErrors.token} value={token} onChangeText={setToken}
        keyboardType="number-pad" autoComplete="one-time-code" maxLength={10} editable={!busy} onSubmitEditing={submit} />}
      {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={s.error}>{error}</Text>}
      {!!notice && <Text accessibilityLiveRegion="polite" style={s.body}>{notice}</Text>}
      {mode !== 'resetSent' && <PrimaryButton label={busy ? 'Please wait…' : actionLabel} variant="white" onPress={submit} disabled={busy || !auth.configured} />}
    </View>
    <View>
      {mode === 'login' && <>
        <AuthLink label="New here? Request access" onPress={() => go('request')} disabled={busy} />
        <AuthLink label="Forgot password?" onPress={() => go('forgot')} disabled={busy} />
        <AuthLink label="Verify my email" onPress={() => go('verify')} disabled={busy} />
      </>}
      {mode === 'verify' && <AuthLink label="Resend confirmation email" disabled={busy || !auth.configured}
        onPress={() => {
          const issue = validateCredentials(email, 'unused');
          if (issue) { setError(issue); return; }
          void run(async () => { await auth.resendVerification(email); setNotice('Check your inbox for a new confirmation link.'); });
        }} />}
      {mode === 'resetSent' && <AuthLink label="Try sending another link" disabled={busy} onPress={() => go('forgot')} />}
      {mode !== 'login' && <AuthLink label="Back to sign in" disabled={busy} onPress={() => {
        if (resetPassword) void run(auth.signOut);
        else go('login');
      }} />}
    </View>
    <Text style={s.body}>Your name, email, and access request are stored online. Body measurements and workout history stay on this device.</Text>
  </AuthLayout>;
}
