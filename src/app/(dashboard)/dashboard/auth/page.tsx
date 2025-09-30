'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { WaveLoader } from '@/components/ui/wave-loader';
import { MARKETING_ROUTES } from '@/constants/routes';

/**
 * Auth handler page
 * 
 * Receives JWT tokens from the marketing site after successful login/signup,
 * verifies them via the API, and stores them securely before redirecting to the dashboard.
 * Shows only the wave loader during the entire process for a seamless experience.
 * 
 * URL: localhost:3001/dashboard/auth?token=jwt_token_here
 */
export default function AuthHandler() {
  const searchParams = useSearchParams();
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasVerified.current) return;
    
    const token = searchParams.get('token');

    if (!token) {
      // No token provided, redirect to login immediately
      window.location.href = MARKETING_ROUTES.LOGIN;
      return;
    }

    hasVerified.current = true;
    // Verify token via API
    verifyToken(token);
  }, [searchParams]);

  async function verifyToken(token: string) {
    try {
      // Send token to verification endpoint
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      // Token verified successfully - set flag and redirect
      sessionStorage.setItem('momentum_auth_transition', 'true');
      window.location.href = '/dashboard';

    } catch (error) {
      // Redirect to login on any error
      window.location.href = MARKETING_ROUTES.LOGIN;
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <WaveLoader />
    </div>
  );
}
