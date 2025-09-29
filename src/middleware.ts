import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { MARKETING_ROUTES } from '@/constants/routes'

/**
 * Middleware to protect dashboard routes
 * 
 * Checks for authentication token and redirects unauthenticated 
 * users to the marketing site login page.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for the auth handler itself
  if (pathname === '/dashboard/auth') {
    return NextResponse.next()
  }

  // Check if accessing dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for auth token in cookies or headers
    const authToken = request.cookies.get('momentum_auth_token')?.value
    
    // Also check localStorage via a custom header (if set by client)
    const authHeader = request.headers.get('x-momentum-auth')

    // If no token found, redirect to login
    if (!authToken && !authHeader) {
      console.log('No auth token found, redirecting to login')
      return NextResponse.redirect(MARKETING_ROUTES.LOGIN)
    }

    // TODO: Optionally validate token here
    // For now, just check if it exists
    
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