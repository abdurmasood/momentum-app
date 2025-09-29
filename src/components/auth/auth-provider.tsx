'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MARKETING_ROUTES } from '@/constants/routes';

/**
 * Auth Provider
 * 
 * Wraps dashboard routes and checks for authentication.
 * Redirects to marketing site login if no auth token found.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Skip auth check for the auth handler page
    if (pathname === '/dashboard/auth') {
      setIsChecking(false);
      setIsAuthenticated(true);
      return;
    }

    // Check for auth token
    const token = localStorage.getItem('momentum_auth_token');
    
    if (!token) {
      // No token found, redirect to login
      console.log('No auth token found, redirecting to login');
      window.location.href = MARKETING_ROUTES.LOGIN;
      return;
    }

    // TODO: Validate token expiration here
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        // Token expired
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('momentum_auth_token');
        localStorage.removeItem('momentum_user');
        window.location.href = MARKETING_ROUTES.LOGIN;
        return;
      }
    } catch (error) {
      // Invalid token format
      console.error('Invalid token format:', error);
      localStorage.removeItem('momentum_auth_token');
      localStorage.removeItem('momentum_user');
      window.location.href = MARKETING_ROUTES.LOGIN;
      return;
    }

    // Token is valid
    setIsAuthenticated(true);
    setIsChecking(false);
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}