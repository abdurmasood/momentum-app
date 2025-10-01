'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
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
  }, [searchParams, router]);

  async function verifyToken(token: string) {
    try {
      // Send token to verification endpoint
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();

      // Store user data temporarily to prevent re-fetch in dashboard
      sessionStorage.setItem('momentum_user_cache', JSON.stringify(data.user));

      // Use client-side navigation instead of hard redirect
      router.push('/dashboard');

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
