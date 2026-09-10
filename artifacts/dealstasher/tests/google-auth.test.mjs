import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  attemptGoogleAuth,
  GOOGLE_AUTH_FAILURE_MESSAGE,
} from '../lib/googleAuth.ts';

const componentSource = await readFile(new URL('../components/GoogleAuthButton.tsx', import.meta.url), 'utf8');

test('cancelled Google handoffs use the stable user-facing message', async () => {
  const result = await attemptGoogleAuth(
    async () => {
      throw new Error('OAuth provider secret details');
    },
    'dealstasher://oauth-native',
  );

  assert.deepEqual(result, { kind: 'error', message: GOOGLE_AUTH_FAILURE_MESSAGE });
  assert.equal(result.message.includes('OAuth provider secret details'), false);
});

test('failed Google handoffs hide provider details behind the stable message', async () => {
  const result = await attemptGoogleAuth(
    async () => {
      throw { error: 'provider_internal_error', detail: 'raw provider response' };
    },
    'dealstasher://oauth-native',
  );

  assert.deepEqual(result, { kind: 'error', message: GOOGLE_AUTH_FAILURE_MESSAGE });
  assert.equal(result.message.includes('provider_internal_error'), false);
  assert.equal(result.message.includes('raw provider response'), false);
});

test('a retry starts Google again without navigating away', async () => {
  let attempts = 0;
  let navigations = 0;

  const startSSOFlow = async () => {
    attempts += 1;
    throw new Error('cancelled');
  };

  const firstAttempt = await attemptGoogleAuth(startSSOFlow, 'dealstasher://oauth-native');
  const retryAttempt = await attemptGoogleAuth(startSSOFlow, 'dealstasher://oauth-native');

  if (firstAttempt.kind === 'active' || retryAttempt.kind === 'active') {
    navigations += 1;
  }

  assert.equal(attempts, 2);
  assert.equal(navigations, 0);
  assert.equal(retryAttempt.message, GOOGLE_AUTH_FAILURE_MESSAGE);
});

test('the rendered retry control invokes the same Google action and does not expose provider errors', () => {
  assert.match(componentSource, /testID="google-auth-retry"[\s\S]*onPress=\{continueWithGoogle\}/);
  assert.doesNotMatch(componentSource, /oauthError\.message|error\.message/);
});