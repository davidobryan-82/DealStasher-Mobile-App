import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  EMAIL_VERIFICATION_MESSAGE,
  EMAIL_VERIFICATION_RETRY_MESSAGE,
  getAuthErrorMessage,
  SIGN_IN_INVALID_MESSAGE,
  SIGN_UP_EXISTS_MESSAGE,
} from '../lib/authErrors.ts';

const authSources = await Promise.all([
  readFile(new URL('../app/(auth)/sign-in.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../app/(auth)/sign-up.tsx', import.meta.url), 'utf8'),
]);

test('email auth screens never render provider error messages directly', () => {
  for (const source of authSources) {
    assert.doesNotMatch(source, /error\.message|errors\?\.fields\..*\.message|errors\.fields\..*\.message/);
  }
});

test('invalid sign-in credentials use a concise app-owned message', () => {
  const result = getAuthErrorMessage({ code: 'form_password_incorrect', message: 'provider secret' }, 'signIn');

  assert.equal(result, SIGN_IN_INVALID_MESSAGE);
  assert.equal(result.includes('provider secret'), false);
});

test('email verification errors explain how to recover without exposing provider details', () => {
  const result = getAuthErrorMessage({ code: 'verification_code_expired', message: 'internal verification detail' }, 'emailVerification');

  assert.equal(result, EMAIL_VERIFICATION_MESSAGE);
  assert.equal(result.includes('internal verification detail'), false);
});

test('retryable auth failures use retry guidance', () => {
  assert.equal(
    getAuthErrorMessage({ status: 503, message: 'upstream details' }, 'emailVerification'),
    EMAIL_VERIFICATION_RETRY_MESSAGE,
  );
});

test('existing sign-up accounts receive sign-in guidance', () => {
  assert.equal(getAuthErrorMessage({ code: 'form_identifier_exists' }, 'signUp'), SIGN_UP_EXISTS_MESSAGE);
});