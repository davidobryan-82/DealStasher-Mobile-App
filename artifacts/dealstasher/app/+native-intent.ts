function appendUrlParts(pathname: string, search: string, hash: string): string {
  return `${pathname || '/'}${search}${hash}`;
}

export function getNativeIntentPath(path: string): string {
  if (path.startsWith('/')) return path;

  try {
    const url = new URL(path);

    if (url.hostname === 'expo-sharing' || url.protocol === 'expo-sharing:') return '/';

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return appendUrlParts(url.pathname, url.search, url.hash);
    }

    if (url.protocol === 'dealstasher:') {
      const routePath = url.host ? `/${url.host}${url.pathname}` : url.pathname;
      return appendUrlParts(routePath, url.search, url.hash);
    }

    return path;
  } catch {
    return '/';
  }
}

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return getNativeIntentPath(path);
}