const pendingClaims = new Map<string, Promise<unknown>>();
const completedClaims = new Map<string, unknown>();

export function getCompletedSharedInboxClaim<T>(key: string): T | undefined {
  return completedClaims.get(key) as T | undefined;
}

export function claimSharedInboxOnce<T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> {
  const completed = getCompletedSharedInboxClaim<T>(key);
  if (completed !== undefined) return Promise.resolve(completed);

  const pending = pendingClaims.get(key);
  if (pending) return pending as Promise<T>;

  let requestPromise: Promise<T>;
  try {
    requestPromise = Promise.resolve(request())
      .then((result) => {
        pendingClaims.delete(key);
        completedClaims.set(key, result);
        return result;
      })
      .catch((error) => {
        pendingClaims.delete(key);
        throw error;
      });
  } catch (error) {
    pendingClaims.delete(key);
    return Promise.reject(error);
  }

  pendingClaims.set(key, requestPromise);
  return requestPromise;
}

export function clearSharedInboxClaim(key: string): void {
  pendingClaims.delete(key);
  completedClaims.delete(key);
}