import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../state/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme';
import { AuthLayout, authStyles as s, authErrorMessage } from './AuthUI';

export function AccessStatusScreen() {
  const { currentUser, accountError, refreshAccount, refreshing, signOut } = useAuth();
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const title = accountError ? 'Unable to check access' : !currentUser ? 'Checking your account' :
    currentUser.status === 'rejected' ? 'Request not approved' : 'Waiting for approval';
  const subtitle = accountError ?? (!currentUser ? 'This usually takes a moment.' : currentUser.status === 'rejected'
    ? 'Your registration request was declined. Contact the app owner if you think this was a mistake.'
    : 'Your registration request is with the admin. You can begin training after it is approved.');
  return <AuthLayout title={title} subtitle={subtitle}>
    {currentUser && <View style={s.notice}>
      <Text style={s.label}>{currentUser.display_name}</Text>
      <Text style={s.body}>{currentUser.email}</Text>
      <Text style={s.label}>{currentUser.status === 'rejected' ? 'Not approved' : 'Pending review'}</Text>
    </View>}
    {refreshing && <ActivityIndicator color={colors.accentLight} accessibilityLabel="Checking access" />}
    {(currentUser || accountError) && <PrimaryButton label="Check status" variant="white" disabled={refreshing || leaving} onPress={() => void refreshAccount()} />}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <PrimaryButton label={leaving ? 'Signing out…' : 'Sign out'} variant="outline" disabled={leaving} onPress={() => {
      setLeaving(true); setError('');
      void signOut().catch(e => setError(authErrorMessage(e))).finally(() => setLeaving(false));
    }} />
  </AuthLayout>;
}
