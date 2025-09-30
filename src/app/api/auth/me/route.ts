import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

/**
 * JWT token payload structure
 */
interface TokenPayload {
  user: {
    id: string
    email: string
    name: string
  }
  exp: number
  iat: number
}

/**
 * GET /api/auth/me
 * 
 * Returns the current authenticated user from JWT token in cookie
 * 
 * @returns User data or 401 error
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Return user data
    return NextResponse.json({ 
      user: decoded.user 
    })

  } catch (error) {
    console.error('Failed to get current user:', error)

    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}