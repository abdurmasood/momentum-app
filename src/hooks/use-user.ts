"use client"

import { useState, useEffect, useCallback } from 'react'

/**
 * User data structure from JWT token
 */
export interface User {
  id: string
  email: string
  name: string
}

/**
 * Hook return interface
 */
interface UseUserResult {
  user: User | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch and manage current authenticated user
 * 
 * Fetches user data from `/api/auth/me` endpoint which verifies
 * the JWT token stored in httpOnly cookie.
 * 
 * @returns User data, loading state, error state, and refetch function
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check for cached user data from auth flow
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('momentum_user_cache');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
            setLoading(false);
            // Clear cache and verify in background
            sessionStorage.removeItem('momentum_user_cache');
            // Continue to verify with API but don't show loading
            verifyUserInBackground();
            return;
          } catch (e) {
            // Invalid cache, continue with normal fetch
            sessionStorage.removeItem('momentum_user_cache');
          }
        }
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - this is expected for logged-out users
          setUser(null)
          return
        }

        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUser(data.user)

    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Background verification without showing loading state
  const verifyUserInBackground = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (err) {
      // Silent fail for background verification
      console.error('Background user verification failed:', err)
    }
  }

  // Fetch user on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  }
}