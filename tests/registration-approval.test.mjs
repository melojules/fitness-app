import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
after(() => db.close());
const admin = '11111111-1111-4111-8111-111111111111';
const member = '22222222-2222-4222-8222-222222222222';
const other = '33333333-3333-4333-8333-333333333333';
const unverified = '44444444-4444-4444-8444-444444444444';

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to authenticated, anon;
  grant execute on function auth.uid() to authenticated;
`);
await db.exec(await readFile(new URL('../supabase/migrations/202609160001_registration_approval.sql', import.meta.url), 'utf8'));
await db.query(`insert into auth.users values
 ($1, 'owner@example.test', '{"display_name":"Owner"}', now()),
 ($2, 'member@example.test', '{"display_name":"Member","role":"admin","status":"approved"}', now()),
 ($3, 'other@example.test', '{"display_name":"Other"}', now()),
 ($4, 'unverified@example.test', '{"display_name":"Unverified"}', null)`, [admin, member, other, unverified]);
await db.query(`update public.member_accounts set role = 'admin', status = 'approved' where id = $1`, [admin]);

async function asUser(id, callback, role = 'authenticated') {
  await db.exec('begin');
  try {
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id]);
    await db.exec(`set local role ${role}`);
    const result = await callback();
    await db.exec('commit');
    return result;
  } catch (error) { await db.exec('rollback'); throw error; }
}

test('registration ignores attempted admin and approval claims', async () => {
  const { rows } = await asUser(member, () => db.query('select * from public.member_accounts'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].role, 'user');
  assert.equal(rows[0].status, 'pending');
});

test('pending users cannot read another member or admin account', async () => {
  const { rows } = await asUser(member, () => db.query('select * from public.member_accounts where id = $1', [admin]));
  assert.equal(rows.length, 0);
});

test('anonymous clients cannot enumerate accounts or review requests', async () => {
  await assert.rejects(asUser('', () => db.query('select * from public.member_accounts'), 'anon'), /permission denied/);
  await assert.rejects(asUser('', () => db.query("select public.review_registration($1, 'approved')", [member]), 'anon'), /permission denied/);
});

test('members cannot approve themselves or modify role directly', async () => {
  await assert.rejects(asUser(member, () => db.query("select public.review_registration($1, 'approved')", [member])), /Admin access required/);
  await assert.rejects(asUser(member, () => db.query("update public.member_accounts set role = 'admin', status = 'approved' where id = $1", [member])), /permission denied/);
  await assert.rejects(asUser(member, () => db.query('delete from public.member_accounts where id = $1', [member])), /permission denied/);
});

test('verified admin can read the queue and approve a verified member', async () => {
  const { rows } = await asUser(admin, () => db.query("select * from public.member_accounts where status = 'pending'"));
  assert.equal(rows.length, 3);
  await asUser(admin, () => db.query("select public.review_registration($1, 'approved')", [member]));
  const { rows: own } = await asUser(member, () => db.query('select * from public.member_accounts'));
  assert.equal(own.length, 1);
  assert.equal(own[0].status, 'approved');
  assert.equal(own[0].role, 'user');
  assert.equal(own[0].reviewed_by, admin);
  assert.ok(own[0].reviewed_at);
});

test('approved member still cannot review or see other accounts', async () => {
  await assert.rejects(asUser(member, () => db.query("select public.review_registration($1, 'approved')", [other])), /Admin access required/);
});

test('duplicate or stale decisions do not overwrite a prior decision', async () => {
  await assert.rejects(asUser(admin, () => db.query("select public.review_registration($1, 'rejected')", [member])), /already reviewed/);
});

test('admin may reject a request; rejected member retains only own status access', async () => {
  await asUser(admin, () => db.query("select public.review_registration($1, 'rejected')", [other]));
  const { rows } = await asUser(other, () => db.query('select * from public.member_accounts'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'rejected');
});

test('unverified email cannot be approved and verification syncs from Auth only', async () => {
  await assert.rejects(asUser(admin, () => db.query("select public.review_registration($1, 'approved')", [unverified])), /email not verified/);
  await assert.rejects(asUser(unverified, () => db.query('update public.member_accounts set email_verified = true where id = $1', [unverified])), /permission denied/);
  await db.query('update auth.users set email_confirmed_at = now() where id = $1', [unverified]);
  await asUser(admin, () => db.query("select public.review_registration($1, 'approved')", [unverified]));
});

test('invalid decisions, admin self-review, and admin direct API writes are rejected', async () => {
  await assert.rejects(asUser(admin, () => db.query("select public.review_registration($1, 'admin')", [other])), /Invalid review decision/);
  await assert.rejects(asUser(admin, () => db.query("select public.review_registration($1, 'approved')", [admin])), /already reviewed/);
  await assert.rejects(asUser(admin, () => db.query("update public.member_accounts set role = 'admin' where id = $1", [member])), /permission denied/);
});

test('an unverified or unapproved admin cannot review requests', async () => {
  await db.query("update public.member_accounts set status = 'pending' where id = $1", [admin]);
  await assert.rejects(asUser(admin, () => db.query("select public.review_registration($1, 'approved')", [other])), /Admin access required/);
});
