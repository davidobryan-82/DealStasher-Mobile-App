export type AuthErrorContext = 'signIn' | 'signUp' | 'signUpEmail' | 'emailVerification';

export const SIGN_IN_INVALID_MESSAGE = 'We could not sign you in. Check your email and password and try again.';
export const SIGN_IN_RETRY_MESSAGE = 'We could not sign you in right now. Check your connection and try again.';
export const SIGN_IN_INCOMPLETE_MESSAGE = 'This account needs another verification step. Check your email and try again.';
export const SIGN_UP_RETRY_MESSAGE = 'We could not create your account right now. Check your connection and try again.';
export const SIGN_UP_EMAIL_MESSAGE = 'Enter a valid email address or try a different email.';
export const SIGN_UP_EXISTS_MESSAGE = 'An account with this email already exists. Try signing in instead.';
export const SIGN_UP_PASSWORD_MESSAGE = 'Choose a stronger password and try again.';
export const EMAIL_VERIFICATION_MESSAGE = 'That code is invalid or expired. Check your email and try again.';
export const EMAIL_VERIFICATION_RETRY_MESSAGE = 'We could not verify your email right now. Request a new code and try again.';

type ClerkErrorLike = {
  code?: unknown;
  status?: unknown;
};

const RETRYABLE_CODES = new Set([
  'internal_server_error',
  'network_error',
  'request_timeout',
  'rate_limit_exceeded',
  'too_many_requests',
]);

function getErrorDetails(error: unknown): ClerkErrorLike {
  return typeof error === 'object' && error !== null ? error as ClerkErrorLike : {};
}

function getCode(error: unknown): string {
  const code = getErrorDetails(error).code;
  return typeof code === 'string' ? code.toLowerCase() : '';
}

function isRetryable(error: unknown, code: string): boolean {
  const status = getErrorDetails(error).status;
  return RETRYABLE_CODES.has(code) || (typeof status === 'number' && (status === 429 || status >= 500));
}

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext): string | null {
  if (!error) return null;

  const code = getCode(error);
  if (isRetryable(error, code)) {
    return context === 'emailVerification' ? EMAIL_VERIFICATION_RETRY_MESSAGE : context === 'signIn' ? SIGN_IN_RETRY_MESSAGE : SIGN_UP_RETRY_MESSAGE;
  }

  if (context === 'signIn') {
    if (code.includes('verification') || code.includes('needs_first_factor')) return SIGN_IN_INCOMPLETE_MESSAGE;
    return SIGN_IN_INVALID_MESSAGE;
  }

  if (context === 'emailVerification') {
    return EMAIL_VERIFICATION_MESSAGE;
  }

  if (context === 'signUpEmail') {
    if (code.includes('exists') || code.includes('already')) return SIGN_UP_EXISTS_MESSAGE;
    return SIGN_UP_EMAIL_MESSAGE;
  }

  if (code.includes('exists') || code.includes('already')) return SIGN_UP_EXISTS_MESSAGE;
  if (code.includes('password')) return SIGN_UP_PASSWORD_MESSAGE;
  if (code.includes('email') || code.includes('identifier') || code.includes('format')) return SIGN_UP_EMAIL_MESSAGE;
  return SIGN_UP_RETRY_MESSAGE;
}