import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { redirectSystemPath } from '../app/+native-intent.ts';
import { buildAuthRoute, getSharedInboxRedirect } from '../lib/authRedirect.ts';

const sharedToken = 'friend-share-token-7f2a';
const sharedRoute = getSharedInboxRedirect(sharedToken);

test('a cold-start shared link reaches sign-in with the exact token route', () => {
  const incomingUrl = `https://www.dealstasher.com${sharedRoute}`;
  const nativePath = redirectSystemPath({ path: incomingUrl, initial: true });

  assert.equal(nativePath, sharedRoute);
  assert.deepEqual(buildAuthRoute('/sign-in', nativePath), {
    pathname: '/sign-in',
    params: { redirect: sharedRoute },
  });
});

test('a shared link received while the app is resumed keeps the exact token route', () => {
  const incomingUrl = `https://dealstasher.com${sharedRoute}`;
  const nativePath = redirectSystemPath({ path: incomingUrl, initial: false });

  assert.equal(nativePath, sharedRoute);
  assert.deepEqual(buildAuthRoute('/sign-up', nativePath), {
    pathname: '/sign-up',
    params: { redirect: sharedRoute },
  });
});

test('custom-scheme links and relative route entries preserve the shared token', () => {
  assert.equal(
    redirectSystemPath({ path: `dealstasher://inbox/${sharedToken}`, initial: true }),
    sharedRoute,
  );
  assert.equal(
    redirectSystemPath({ path: sharedRoute, initial: false }),
    sharedRoute,
  );
});

test('sharing callbacks still return to the app root', () => {
  assert.equal(
    redirectSystemPath({ path: 'expo-sharing://share?text=hello', initial: true }),
    '/',
  );
});

test('native configuration registers both universal-link hosts for shared inbox routes', () => {
  const config = JSON.parse(
    readFileSync(new URL('../app.json', import.meta.url), 'utf8'),
  ).expo;
  const associatedDomains = config.ios.associatedDomains;
  const inboxFilters = config.android.intentFilters.filter((filter) =>
    filter.data.some((entry) => entry.pathPrefix === '/inbox'),
  );

  assert.deepEqual(associatedDomains, [
    'applinks:dealstasher.com',
    'applinks:www.dealstasher.com',
  ]);
  assert.deepEqual(
    inboxFilters.flatMap((filter) => filter.data.map((entry) => entry.host)).sort(),
    ['dealstasher.com', 'www.dealstasher.com'],
  );
  assert.ok(inboxFilters.every((filter) => filter.action === 'VIEW'));
  assert.ok(inboxFilters.every((filter) => filter.autoVerify));
});