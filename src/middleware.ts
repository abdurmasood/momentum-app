import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://trymomentum.ai'

/**
 * Middleware to protect dashboard routes
 * 
 * Checks for JWT token cookie and redirects unauthenticated users to login.
 * Token verification happens in API routes (which run in Node.js runtime).
 * 
 * Note: Middleware runs in Edge runtime which doesn't support jsonwebtoken,
 * so we only check for token existence here. Full verification happens
 * in API routes and protected page loads.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for the auth handler itself
  if (pathname === '/dashboard/auth') {
    return NextResponse.next()
  }

  // DEVELOPMENT MODE: Optional auth bypass with env variable
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_CHECK === 'true') {
    console.log('🔓 Development mode: Auth check bypassed via SKIP_AUTH_CHECK');
    return NextResponse.next()
  }

  // Check if accessing dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Get auth token from cookie
    const authToken = request.cookies.get('auth_token')?.value

    // If no token found, redirect to login
    if (!authToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No auth token found, redirecting to login')
      }
      return NextResponse.redirect(new URL(`${MARKETING_URL}/login`))
    }

    // Token exists - allow access
    // Full verification will happen when API routes are called
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Auth token found, granting access to:', pathname)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

/**
 * Configure which routes this middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all dashboard routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/dashboard/:path*',
  ],
}
