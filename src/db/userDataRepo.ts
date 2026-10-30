import { getDb } from './client';

export async function loadUserData<T>(userId: string): Promise<T | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data_json: string }>(
    'SELECT data_json FROM user_data WHERE user_id = ?',
    userId
  );
  if (!row) return null;
  // A corrupt document must not be mistaken for a new profile and overwritten.
  return JSON.parse(row.data_json) as T;
}

export async function saveUserData(userId: string, data: unknown): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO user_data (user_id, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
    [userId, JSON.stringify(data), now]
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM app_meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO app_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}
