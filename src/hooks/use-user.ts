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