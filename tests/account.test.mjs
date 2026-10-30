import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/auth/account.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { canAccessApp, isAdmin, validateCredentials, validBackendSettings } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('pending, rejected, missing, and unverified accounts cannot enter the app', () => {
  assert.equal(canAccessApp(null), false);
  for (const role of ['admin', 'user']) {
    for (const status of ['pending', 'rejected']) assert.equal(canAccessApp({ role, status, email_verified: true }), false);
    assert.equal(canAccessApp({ role, status: 'approved', email_verified: false }), false);
  }
});

test('only a verified approved admin can access review controls', () => {
  assert.equal(isAdmin({ role: 'user', status: 'approved', email_verified: true }), false);
  assert.equal(canAccessApp({ role: 'user', status: 'approved', email_verified: true }), true);
  assert.equal(isAdmin({ role: 'admin', status: 'approved', email_verified: true }), true);
  assert.equal(isAdmin({ role: 'admin', status: 'pending', email_verified: true }), false);
});

test('registration requires email and a long password; existing shorter passwords can sign in', () => {
  assert.ok(validateCredentials('invalid', 'A-long-password', true));
  assert.ok(validateCredentials('member@example.test', 'short', true));
  assert.ok(validateCredentials('member@example.test', '', false));
  assert.equal(validateCredentials(' member@example.test ', 'A-long-password', true), null);
  assert.equal(validateCredentials('member@example.test', 'legacy', false), null);
});

test('missing, malformed, placeholder, and privileged backend settings fail closed', () => {
  const key = 'sb_publishable_test-key-for-config-only';
  assert.equal(validBackendSettings('', ''), false);
  assert.equal(validBackendSettings('https://', key), false);
  assert.equal(validBackendSettings('http://project.supabase.co', key), false);
  assert.equal(validBackendSettings('https://YOUR-PROJECT.supabase.co', key), false);
  assert.equal(validBackendSettings('https://secret@project.supabase.co', key), false);
  assert.equal(validBackendSettings('https://project.supabase.co?secret=test', key), false);
  assert.equal(validBackendSettings('https://project.supabase.co', 'sb_secret_do-not-include-in-the-app'), false);
  assert.equal(validBackendSettings('https://project.supabase.co', key), true);
});
