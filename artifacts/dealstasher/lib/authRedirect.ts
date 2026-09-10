export type AuthRedirect = string | string[] | undefined;
export type AuthRoutePath = '/sign-in' | '/sign-up';

export function getSharedInboxRedirect(token: string): string {
  return `/inbox/${token}`;
}

export function getAuthRedirect(redirect: AuthRedirect): string {
  return typeof redirect === 'string' ? redirect : '/';
}

export function buildAuthRoute(pathname: AuthRoutePath, redirect: AuthRedirect) {
  return typeof redirect === 'string'
    ? { pathname, params: { redirect } }
    : { pathname };
}