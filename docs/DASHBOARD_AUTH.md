# Dashboard Authentication Integration Guide

## Overview

This document explains how the **Momentum Marketing Website** handles authentication and how the **Dashboard Application** should integrate with it to provide a seamless user experience.

---

## Architecture

### Authentication Flow

```
User → Marketing Website (momentum.com)
  ↓
Login/Signup (Google OAuth OR Email Magic Link)
  ↓
NextAuth v5 Authentication
  ↓
User stored in Neon PostgreSQL Database
  ↓
Custom JWT Token Generated
  ↓
Dashboard Application (dashboard.momentum.com)
  ↓
Token Verification & Session Management
```

---

## Marketing Website Authentication

### Supported Authentication Methods

1. **Google OAuth**
   - Provider: `google`
   - Managed by NextAuth v5
   - Auto-creates user account on first sign-in

2. **Email Magic Link**
   - Provider: `email`
   - Passwordless authentication via Resend
   - 10-minute expiration
   - Single-use tokens

### Database Schema

Users are stored in **Neon PostgreSQL** with the following structure:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  userId            String
  type              String           // "oauth" | "email"
  provider          String           // "google" | "email"
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  // ... other OAuth fields
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([provider, providerAccountId])
}
```

### User Data Available

After authentication, the following user data is available:

```typescript
{
  id: string              // Unique CUID
  email: string           // User's email address
  name: string | null     // User's name (from Google or null for email)
  image: string | null    // Profile picture URL (from Google or null)
  emailVerified: Date     // Timestamp of email verification
}
```

---

## Dashboard Integration

### Step 1: Token Reception

After successful authentication on the marketing website, users are redirected to:

```
{DASHBOARD_URL}/dashboard/auth?token={JWT_TOKEN}
```

**Example:**
```
https://dashboard.momentum.com/dashboard/auth?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: JWT Token Structure

The JWT token is signed with `JWT_SECRET` and contains:

```typescript
{
  user: {
    id: string,      // User ID from database
    email: string,   // User email
    name: string     // User name (or email if name is null)
  },
  exp: number,       // Expiration timestamp (7 days from issue)
  iat: number        // Issued at timestamp
}
```

**Token Validity:** 7 days

### Step 3: Dashboard Implementation

#### A. Create Auth Callback Route

Create a route to handle incoming authentication:

**Path:** `/dashboard/auth` or `/auth/callback`

```typescript
// Example: app/dashboard/auth/page.tsx (Next.js)
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      // No token provided, redirect to marketing site login
      window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL + '/login'
      return
    }
    
    // Verify and store the token
    verifyAndStoreToken(token)
  }, [searchParams, router])
  
  async function verifyAndStoreToken(token: string) {
    try {
      // Step 1: Verify the token with your backend
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      if (!response.ok) {
        throw new Error('Token verification failed')
      }
      
      const { user } = await response.json()
      
      // Step 2: Store token in httpOnly cookie or secure storage
      // (handled by your backend in the verify endpoint)
      
      // Step 3: Redirect to dashboard home
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Authentication error:', error)
      // Redirect back to marketing site login
      window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL + '/login'
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}
```

#### B. Verify JWT Token (Backend)

Create an API endpoint to verify the JWT token:

**Path:** `/api/auth/verify`

```typescript
// Example: app/api/auth/verify/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user: { id: string; email: string; name: string }
      exp: number
      iat: number
    }
    
    // Token is valid - store in httpOnly cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: decoded.user
    })
    
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    )
  }
}
```

#### C. Middleware for Protected Routes

Protect your dashboard routes with authentication middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  
  // Public routes that don't need authentication
  const publicRoutes = ['/dashboard/auth', '/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Check if token exists
  if (!token) {
    // Redirect to marketing site login
    const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL
    return NextResponse.redirect(new URL(`${marketingUrl}/login`))
  }
  
  try {
    // Verify token
    jwt.verify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Token invalid - redirect to login
    const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL
    return NextResponse.redirect(new URL(`${marketingUrl}/login`))
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

#### D. Get Current User Hook

Create a hook to access the current user throughout your dashboard:

```typescript
// hooks/useUser.ts
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser()
  }, [])
  
  async function fetchUser() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return { user, loading }
}
```

```typescript
// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(request: NextRequest) {
  const token = cookies().get('auth_token')?.value
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user: { id: string; email: string; name: string }
    }
    
    return NextResponse.json({ user: decoded.user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
```

---

## User Session Management

### Session Lifecycle

1. **Login:** User authenticates on marketing website
2. **Token Generation:** Custom JWT created with 7-day expiration
3. **Token Transfer:** User redirected to dashboard with token
4. **Token Verification:** Dashboard verifies and stores token
5. **Session Active:** User can access dashboard features
6. **Token Expiry:** After 7 days, user must re-authenticate

### Logout Flow

When user logs out from dashboard:

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear auth cookie
  cookies().delete('auth_token')
  
  // Redirect to marketing site
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL
  return NextResponse.json({ 
    success: true,
    redirectUrl: marketingUrl
  })
}
```

```typescript
// Client-side logout function
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL
}
```

---

## Environment Variables

### Marketing Website (.env)

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://momentum.com"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email Provider
RESEND_API_KEY="re_..."
EMAIL_FROM="Momentum <noreply@trymomentum.ai>"

# JWT for Dashboard
JWT_SECRET="your-shared-jwt-secret"

# Dashboard URL
NEXT_PUBLIC_DASHBOARD_URL="https://dashboard.momentum.com"
```

### Dashboard Application (.env)

```bash
# Marketing Site URL
NEXT_PUBLIC_MARKETING_URL="https://momentum.com"

# JWT Secret (MUST match marketing website)
JWT_SECRET="your-shared-jwt-secret"

# Database (if dashboard needs direct access)
DATABASE_URL="postgresql://..."

# Optional: Share same Neon database for user data access
```

---

## Database Access

### Option 1: Token-Based (Recommended)

Dashboard relies solely on JWT token for user data. No direct database access needed.

**Pros:**
- Clean separation of concerns
- Reduced database connections
- Simpler dashboard setup

**Cons:**
- User data in token can become stale
- Need to refresh token for updated user info

### Option 2: Shared Database

Dashboard connects to the same Neon database to fetch fresh user data.

```typescript
// Dashboard: lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

export { prisma }
```

```typescript
// Fetch user by ID
async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true
    }
  })
  return user
}
```

**Pros:**
- Always fresh user data
- Can query additional user information
- Full access to user records

**Cons:**
- Additional database connection
- Need Prisma setup in dashboard
- Tighter coupling between apps

---

## Security Considerations

### 1. JWT Secret

**CRITICAL:** The `JWT_SECRET` must be:
- Shared between marketing website and dashboard
- Strong and random (minimum 32 characters)
- Stored securely in environment variables
- Never committed to version control

### 2. Token Storage

**Dashboard should:**
- Store tokens in httpOnly cookies (not localStorage)
- Use `secure: true` in production
- Set appropriate `sameSite` policy
- Implement CSRF protection if needed

### 3. Token Validation

**Always validate:**
- Token signature matches JWT_SECRET
- Token hasn't expired
- Token structure is correct
- User ID exists in database (if using shared DB)

### 4. HTTPS

**Production requirements:**
- Both marketing and dashboard must use HTTPS
- Secure cookie transmission
- Prevent man-in-the-middle attacks

---

## Testing the Integration

### Manual Testing Steps

1. **Start both applications:**
   ```bash
   # Marketing website
   cd momentum
   npm run dev  # runs on localhost:3000
   
   # Dashboard
   cd dashboard
   npm run dev  # runs on localhost:3001
   ```

2. **Update environment variables:**
   ```bash
   # Marketing .env
   NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
   
   # Dashboard .env
   NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
   ```

3. **Test authentication flow:**
   - Go to `localhost:3000/login`
   - Sign in with Google or email magic link
   - Verify redirect to `localhost:3001/dashboard/auth?token=...`
   - Confirm token verification and dashboard access

4. **Test protected routes:**
   - Clear cookies
   - Try accessing `localhost:3001/dashboard`
   - Verify redirect to marketing login

5. **Test logout:**
   - Click logout in dashboard
   - Verify redirect to marketing website
   - Confirm token is cleared

### Automated Testing

```typescript
// Example test
describe('Dashboard Authentication', () => {
  it('should accept valid JWT token', async () => {
    const token = jwt.sign(
      {
        user: { id: 'test-id', email: 'test@test.com', name: 'Test' },
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET
    )
    
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
    
    expect(response.status).toBe(200)
  })
  
  it('should reject invalid JWT token', async () => {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalid-token' })
    })
    
    expect(response.status).toBe(401)
  })
})
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid token" error

**Causes:**
- JWT_SECRET mismatch between apps
- Token expired (>7 days old)
- Token corrupted during transmission

**Solution:**
- Verify JWT_SECRET matches exactly
- Check token expiration time
- Ensure proper URL encoding

#### 2. Redirect loop

**Causes:**
- Middleware not excluding public routes
- Token verification failing silently

**Solution:**
- Add `/dashboard/auth` to public routes
- Add proper error logging
- Check middleware configuration

#### 3. CORS errors

**Causes:**
- Different domains without CORS headers
- Cookies not being sent cross-domain

**Solution:**
- Configure CORS in marketing website
- Use `credentials: 'include'` in fetch
- Ensure proper `sameSite` cookie settings

#### 4. Token not persisting

**Causes:**
- Cookie not being set correctly
- HttpOnly or Secure flags misconfigured

**Solution:**
- Check cookie settings in response
- Verify browser cookie storage
- Use proper domain/path settings

---

## Migration from Existing Auth

If you have existing authentication in the dashboard:

1. **Keep parallel authentication** during transition
2. **Migrate user sessions** gradually
3. **Support both old and new tokens** temporarily
4. **Update user records** to link accounts
5. **Deprecate old auth** after full migration

---

## API Reference

### Marketing Website Endpoints

```
POST /api/auth/generate-token
- Generates JWT token for authenticated user
- Requires valid NextAuth session
- Returns: { success: boolean, token: string }
```

### Dashboard Endpoints (To Implement)

```
POST /api/auth/verify
- Verifies JWT token from marketing site
- Body: { token: string }
- Returns: { success: boolean, user: User }

GET /api/auth/me
- Gets current authenticated user
- Requires: auth_token cookie
- Returns: { user: User }

POST /api/auth/logout
- Logs out user and clears session
- Returns: { success: boolean, redirectUrl: string }
```

---

## Support & Maintenance

### Monitoring

Monitor these metrics:
- Failed token verifications
- Token expiration rates
- Authentication errors
- Redirect failures

### Logging

Log the following events:
- Successful authentications
- Token verification failures
- Unexpected errors
- Security violations

### Updates

Keep track of:
- NextAuth version updates
- JWT library updates
- Security patches
- Database schema changes

---

## Contact & Resources

- **Marketing Website Repo:** `/Users/abdurrafeymasood/Desktop/Current/Dev/momentum`
- **Auth Configuration:** `src/lib/auth.ts`
- **Email Templates:** `src/lib/email-templates.ts`
- **Database Schema:** `prisma/schema.prisma`

---

**Last Updated:** 2025-09-30
**Auth Version:** NextAuth v5.0.0-beta.29
**Database:** Neon PostgreSQL