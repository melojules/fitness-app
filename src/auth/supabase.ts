import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient, processLock } from '@supabase/supabase-js';
import { validBackendSettings } from './account';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const authConfigured = validBackendSettings(url, key);

// Native sessions use the OS keychain. The browser uses Supabase's storage adapter.
const nativeStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const supabase = authConfigured ? createClient(url, key, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: nativeStorage, lock: processLock } : {}),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
}) : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Online accounts are not connected yet. Please contact the app owner.');
  return supabase;
}
