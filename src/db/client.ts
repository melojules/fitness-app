import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('fitness_app.db');
  }
  return dbPromise;
}

export async function getDb() {
  const db = await openDb();
  return db;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    INSERT OR IGNORE INTO users (id, name, role, created_at)
    VALUES ('local-device-user', 'Local profile', 'admin', datetime('now'));

    INSERT OR IGNORE INTO user_data (user_id, data_json, updated_at)
    SELECT 'local-device-user', data_json, updated_at
    FROM user_data
    WHERE user_id <> 'local-device-user'
    ORDER BY updated_at DESC
    LIMIT 1;
  `);
  return db;
}
