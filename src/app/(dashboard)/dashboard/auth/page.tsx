'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MARKETING_ROUTES } from '@/constants/routes';

/**
 * Auth handler page
 * 
 * Receives JWT tokens from the marketing site after successful login/signup
 * and securely stores them before redirecting to the dashboard.
 * 
 * URL: trymomentum.ai/dashboard/auth?token=jwt_token_here
 */
export default function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      // No token provided, redirect to login
      setTimeout(() => {
        window.location.href = MARKETING_ROUTES.LOGIN;
      }, 2000);
      return;
    }

    try {
      // Basic JWT validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        throw new Error('Token expired');
      }

      // Store token securely
      localStorage.setItem('momentum_auth_token', token);
      
      // Store user info if available
      if (payload.user) {
        localStorage.setItem('momentum_user', JSON.stringify(payload.user));
      }

      setStatus('success');

      // Clean URL and redirect to dashboard
      window.history.replaceState({}, '', '/dashboard');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Auth token validation failed:', error);
      setStatus('error');
      
      // Clear any existing auth data
      localStorage.removeItem('momentum_auth_token');
      localStorage.removeItem('momentum_user');
      
      // Redirect to login after showing error
      setTimeout(() => {
        window.location.href = MARKETING_ROUTES.LOGIN;
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
            <p className="text-muted-foreground">Authenticating...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mx-auto">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600">Authentication successful! Redirecting...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center mx-auto">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600">Authentication failed. Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}