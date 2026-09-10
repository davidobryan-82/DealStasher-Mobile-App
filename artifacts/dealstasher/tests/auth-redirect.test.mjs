import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAuthRoute,
  getAuthRedirect,
  getSharedInboxRedirect,
} from '../lib/authRedirect.ts';

const sharedToken = 'friend-share-token-7f2a';

test('a signed-out shared inbox token is passed unchanged to both auth entry points', () => {
  const tokenRoute = getSharedInboxRedirect(sharedToken);

  assert.equal(tokenRoute, `/inbox/${sharedToken}`);
  assert.deepEqual(buildAuthRoute('/sign-in', tokenRoute), {
    pathname: '/sign-in',
    params: { redirect: tokenRoute },
  });
  assert.deepEqual(buildAuthRoute('/sign-up', tokenRoute), {
    pathname: '/sign-up',
    params: { redirect: tokenRoute },
  });
});

test('password and Google completion return to the exact shared inbox token route', () => {
  const tokenRoute = getSharedInboxRedirect(sharedToken);

  for (const entryPoint of ['/sign-in', '/sign-up']) {
    const authRoute = buildAuthRoute(entryPoint, tokenRoute);
    const redirect = authRoute.params?.redirect;

    const passwordCompletionRedirect = getAuthRedirect(redirect);
    const googleCompletionRedirect = getAuthRedirect(redirect);

    assert.equal(passwordCompletionRedirect, tokenRoute, `${entryPoint} password completion`);
    assert.equal(googleCompletionRedirect, tokenRoute, `${entryPoint} Google completion`);
  }
});