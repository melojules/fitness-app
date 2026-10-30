export type MemberAccount = {
  id: string;
  email: string;
  display_name: string;
  request_message: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  email_verified: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export function canAccessApp(account: MemberAccount | null): boolean {
  return account?.status === 'approved' && account.email_verified === true;
}

export function isAdmin(account: MemberAccount | null): boolean {
  return canAccessApp(account) && account?.role === 'admin';
}

export function validateCredentials(email: string, password: string, registration = false) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (registration && password.length < 12) return 'Use at least 12 characters for your password.';
  return null;
}

export function validBackendSettings(url: string, key: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !!parsed.hostname && !url.includes('YOUR-PROJECT') &&
      !parsed.username && !parsed.password && !parsed.search && !parsed.hash &&
      (parsed.pathname === '/' || parsed.pathname === '') &&
      key.startsWith('sb_publishable_') && key.length > 20;
  } catch { return false; }
}
