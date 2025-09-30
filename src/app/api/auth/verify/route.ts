import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

/**
 * JWT token payload structure from marketing site
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
 * POST /api/auth/verify
 * 
 * Verifies JWT token from marketing site and sets httpOnly cookie
 * 
 * @param request - Request containing JWT token in body
 * @returns User data or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Token is valid - create response with cookie
    const response = NextResponse.json({
      success: true,
      user: decoded.user
    })

    // Set cookie on response object
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Token verification failed:', error)

    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token signature' },
        { status: 401 }
      )
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 401 }
      )
    }

    // Generic error
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 401 }
    )
  }
}