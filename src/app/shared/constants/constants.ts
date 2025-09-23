/**
 * cryptoKey
 *
 * Configuration object for AES encryption/decryption.
 * - `production`: Flag indicating if the app is in production mode.
 * - `cryptoKey`: Secret key used for AES encryption (must be 16/24/32 chars).
 * - `cryptoIV`: Initialization vector for AES (must be 16 chars).
 *
 * NOTE: These values must be securely populated before use.
 */
export const cryptoKey = {
  production: false,
  cryptoKey: '',
  cryptoIV: ''
};

/**
 * loginConstants
 *
 * Text constants for the login screen.
 * Helps ensure consistent language across UI.
 */
export const loginConstants = {
  LOGIN_TITLE: 'Login with email',
  LOGIN_DESCRIPTION: 'Access your workspace to create, collaborate, and stay organized — all in one place.',
  LOGIN_BUTTON: 'Login',
}

/**
 * forgotPasswordConstants
 *
 * Text constants for the forgot password screen.
 */
export const forgotPasswordConstants = {
  FORGOT_PASSWORD_TITLE: 'Forgot Password?',
  FORGOT_PASSWORD_DESCRIPTION: 'Enter your email address and we’ll send you a link to reset your password.',
  FORGOT_PASSWORD_BUTTON: 'Send Reset Link',
}

/**
 * resetPasswordConstants
 *
 * Text constants for the reset password screen.
 */
export const resetPasswordConstants = {
  RESET_PASSWORD_TITLE: 'Change your password',
  RESET_PASSWORD_DESCRIPTION: 'Set a new password and confirm it to secure your account.',
  RESET_PASSWORD_BUTTON: 'Update Password',
}