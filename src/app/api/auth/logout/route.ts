import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://trymomentum.ai'

/**
 * POST /api/auth/logout
 * 
 * Logs out the user by clearing the auth cookie
 * 
 * @returns Success response with redirect URL
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')

    // Log logout in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 User logged out successfully')
    }

    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl: `${MARKETING_URL}/login`
    })

  } catch (error) {
    console.error('Logout failed:', error)
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}