export const GOOGLE_AUTH_FAILURE_MESSAGE = 'Google sign-in was cancelled or did not finish. Please try again.';
export const GOOGLE_AUTH_INCOMPLETE_MESSAGE = 'Google sign-in needs one more step. Try again or use email instead.';

type GoogleAuthFlowResponse = {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
  signIn?: { status?: string | null };
  signUp?: { status?: string | null };
};

type GoogleAuthFlowOptions = {
  strategy: 'oauth_google';
  redirectUrl: string;
};

type GoogleAuthFlowStarter = (options: GoogleAuthFlowOptions) => Promise<GoogleAuthFlowResponse>;

export type GoogleAuthAttempt =
  | { kind: 'active'; sessionId: string }
  | { kind: 'error'; message: string };

export async function attemptGoogleAuth(
  startSSOFlow: GoogleAuthFlowStarter,
  redirectUrl: string,
): Promise<GoogleAuthAttempt> {
  try {
    const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
      strategy: 'oauth_google',
      redirectUrl,
    });

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
      return { kind: 'active', sessionId: createdSessionId };
    }

    if (signUp?.status === 'missing_requirements' || signIn?.status === 'needs_first_factor') {
      return { kind: 'error', message: GOOGLE_AUTH_INCOMPLETE_MESSAGE };
    }

    return { kind: 'error', message: 'Google sign-in did not finish. Please try again.' };
  } catch {
    return { kind: 'error', message: GOOGLE_AUTH_FAILURE_MESSAGE };
  }
}