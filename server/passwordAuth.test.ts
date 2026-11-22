import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './passwordAuth';

test('password hashes are salted and verify only the matching password', async () => {
  const password = 'example-password-1899';
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, secondHash);
  assert.equal(firstHash.includes(password), false);
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword('wrong-password', firstHash), false);
});

test('invalid password hash formats are rejected', async () => {
  assert.equal(await verifyPassword('some-password', 'plain-text-password'), false);
});
