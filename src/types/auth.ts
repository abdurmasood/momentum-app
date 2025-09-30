/**
 * Shared authentication types for the Momentum dashboard
 */

/**
 * User data structure from JWT token
 */
export interface User {
  id: string
  email: string
  name: string
}

/**
 * JWT token payload structure
 */
export interface TokenPayload {
  user: User
  exp: number
  iat: number
}

/**
 * API response for token verification
 */
export interface VerifyTokenResponse {
  success: boolean
  user?: User
  error?: string
}

/**
 * API response for current user
 */
export interface CurrentUserResponse {
  user: User
}

/**
 * API response for logout
 */
export interface LogoutResponse {
  success: boolean
  redirectUrl: string
  error?: string
}