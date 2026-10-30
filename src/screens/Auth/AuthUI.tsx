import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, radius } from '../../theme';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <SafeAreaView style={authStyles.safe} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={authStyles.scroll}>
        <View style={authStyles.content}>
          <Text style={authStyles.brand}>FITNESS / YOUR NEXT SET</Text>
          <View style={{ gap: 10 }}>
            <Text accessibilityRole="header" style={authStyles.title}>{title}</Text>
            <Text style={authStyles.body}>{subtitle}</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function AuthField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 8 }}>
    <Text style={authStyles.label}>{label}</Text>
    <TextInput {...props} accessibilityLabel={label} accessibilityHint={error}
      placeholderTextColor={colors.inkMuted}
      style={[authStyles.input, props.multiline && { minHeight: 96, textAlignVertical: 'top' }, error && { borderColor: colors.live }, props.style]} />
    {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
  </View>;
}

export function AuthLink({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [authStyles.link, pressed && { backgroundColor: colors.surfaceAlt2 }]}>
    <Text style={authStyles.linkText}>{label}</Text>
  </Pressable>;
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const message = (error as { message?: string })?.message?.toLowerCase() ?? '';
  if (code === 'invalid_credentials') return 'Email or password is incorrect.';
  if (code === 'email_not_confirmed') return 'Verify your email first. Use “Verify my email” below.';
  if (code === 'user_already_exists') return 'If you already requested access, sign in to check your status.';
  if (code === 'weak_password') return 'Choose a stronger password with at least 12 characters.';
  if (code === 'otp_expired') return 'This code is invalid or expired. Request a new one.';
  if (code?.includes('rate_limit') || message.includes('rate limit')) return 'Too many attempts. Please wait before trying again. Email limits may take up to an hour to reset.';
  if (code === 'email_address_not_authorized') return 'This project’s email service cannot send to that address yet. The app owner must configure custom SMTP.';
  if (code === 'email_address_invalid' || code === 'validation_failed') return 'Enter a valid email address and try again.';
  if (code === 'request_timeout' || message.includes('fetch') || message.includes('network')) return 'Could not reach the account service. Check your connection and try again.';
  if (code === 'unexpected_failure' || message.includes('smtp') || message.includes('email')) return 'The email service could not send this message. Ask the app admin to check the Supabase email settings.';
  return 'Could not complete that request. Check your connection and try again.';
}

export const authStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 24, paddingVertical: 40, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 24 },
  brand: { fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: 1.2, color: colors.accentLight },
  title: { fontFamily: fontFamily.bold, fontSize: 32, letterSpacing: -0.7, color: colors.ink },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 23, color: colors.inkMuted },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, color: colors.ink },
  input: { minHeight: 52, padding: 14, borderRadius: radius.field, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.inkMuted, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 16 },
  form: { gap: 18 },
  notice: { backgroundColor: colors.surface, padding: 18, borderRadius: radius.card, gap: 10,
    borderWidth: 1, borderColor: colors.hairline },
  error: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 21, color: colors.ink },
  link: { minHeight: 48, justifyContent: 'center', paddingVertical: 12, borderRadius: radius.field },
  linkText: { fontFamily: fontFamily.semibold, fontSize: 14, color: colors.accentLight, textAlign: 'center' },
});
