import assert from 'node:assert/strict';
import test from 'node:test';
import {
  claimSharedInboxOnce,
  clearSharedInboxClaim,
  getCompletedSharedInboxClaim,
} from '../lib/sharedInboxClaim.ts';

const claimKey = 'user-123:friend-share-token-7f2a';

test('repeated opens share one in-flight claim and keep the saved result', async () => {
  clearSharedInboxClaim(claimKey);

  let requestCount = 0;
  let resolveRequest;
  const savedItem = { id: 'inbox-1', token: 'friend-share-token-7f2a' };
  const request = () => {
    requestCount += 1;
    return new Promise((resolve) => {
      resolveRequest = resolve;
    });
  };

  const firstOpen = claimSharedInboxOnce(claimKey, request);
  const secondOpen = claimSharedInboxOnce(claimKey, request);

  assert.strictEqual(firstOpen, secondOpen);
  assert.equal(requestCount, 1);

  resolveRequest(savedItem);
  assert.deepEqual(await Promise.all([firstOpen, secondOpen]), [savedItem, savedItem]);
  assert.deepEqual(getCompletedSharedInboxClaim(claimKey), savedItem);
});

test('a resumed open reuses a completed claim without another request', async () => {
  clearSharedInboxClaim(claimKey);

  let requestCount = 0;
  const savedItem = { id: 'inbox-2', token: 'friend-share-token-7f2a' };
  const firstResult = await claimSharedInboxOnce(claimKey, async () => {
    requestCount += 1;
    return savedItem;
  });
  const resumedResult = await claimSharedInboxOnce(claimKey, async () => {
    requestCount += 1;
    return { id: 'unexpected-duplicate' };
  });

  assert.deepEqual(firstResult, savedItem);
  assert.deepEqual(resumedResult, savedItem);
  assert.equal(requestCount, 1);
});