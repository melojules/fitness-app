import { getDb } from './client';

export type UserRole = 'admin' | 'user';

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
};

function fromRow(row: UserRow): AppUser {
  return { id: row.id, name: row.name, role: row.role, createdAt: row.created_at };
}

export async function getAllUsers(): Promise<AppUser[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<UserRow>('SELECT * FROM users ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export async function getUser(id: string): Promise<AppUser | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
  return row ? fromRow(row) : null;
}

export async function getAdminUser(): Promise<AppUser | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  return row ? fromRow(row) : null;
}

export async function createUser(name: string, role: UserRole): Promise<AppUser> {
  const db = await getDb();
  const user: AppUser = {
    id: `user_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    name,
    role,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync('INSERT INTO users (id, name, role, created_at) VALUES (?, ?, ?, ?)', [
    user.id,
    user.name,
    user.role,
    user.createdAt,
  ]);
  return user;
}

export async function ensureAdminUser(): Promise<AppUser> {
  const existing = await getAdminUser();
  if (existing) return existing;
  return createUser('Admin', 'admin');
}

// A local mirror for data ownership, never an authority for sign-in or permissions.
export async function cacheSignedInUser(id: string, name: string, role: UserRole, createdAt: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO users (id, name, role, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, role = excluded.role`,
    [id, name, role, createdAt]
  );
}
