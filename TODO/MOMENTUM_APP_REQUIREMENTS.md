# Momentum App Requirements for Production

**Version**: 1.0.0
**Last Updated**: January 2025
**Purpose**: Complete implementation guide for the `momentum-app` dashboard repository to integrate with the Momentum marketing site authentication flow on Vercel production.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Database Requirements](#database-requirements)
5. [JWT Token Specification](#jwt-token-specification)
6. [Required Implementations](#required-implementations)
7. [Vercel Deployment Configuration](#vercel-deployment-configuration)
8. [Security Requirements](#security-requirements)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### System Architecture

The Momentum platform uses a **two-application architecture**:

1. **Marketing Site** (`momentum` repo - THIS repo):
   - Handles authentication (Google OAuth + Email Magic Links)
   - Generates JWT tokens after successful authentication
   - Redirects to dashboard with JWT token

2. **Dashboard App** (`momentum-app` repo - TARGET repo):
   - Receives JWT token from marketing site
   - Validates token and creates dashboard session
   - Provides authenticated application experience

### Authentication Flow

```
User Signs In (Marketing Site)
        ↓
NextAuth Authentication (Google OAuth / Email Magic Link)
        ↓
Redirect to /auth/callback
        ↓
Generate Custom JWT Token (7-day expiry)
        ↓
Redirect to Dashboard: https://app.yourdomain.com/dashboard/auth?token={jwt}
        ↓
Dashboard Validates JWT  ← YOU ARE HERE (momentum-app)
        ↓
Dashboard Creates Session
        ↓
Redirect to Dashboard Home (token cleared from URL)
        ↓
User Authenticated in Dashboard
```

### Key Design Decisions

- **JWT Tokens** for cross-application authentication
- **7-day token/session expiry** (matches marketing site)
- **Shared Database** (Neon PostgreSQL)
- **Cookie-based sessions** (recommended) or database sessions
- **HTTPS-only** in production (Vercel automatic)

---

## Prerequisites

### 1. Shared Database Access

Both applications MUST connect to the **same Neon PostgreSQL database**.

**Why**: User records created during authentication on the marketing site must be accessible by the dashboard app.

**Setup**:
- Use the same `DATABASE_URL` as the marketing site
- Or use database replication if needed

### 2. Matching JWT Secret

The `JWT_SECRET` environment variable MUST be **identical** in both applications.

**Why**: JWT tokens are signed with this secret on the marketing site and must be verified with the same secret on the dashboard.

**Security**: Use a cryptographically secure random string (minimum 32 characters).

```bash
# Generate a secure secret
openssl rand -base64 32
```

### 3. Vercel Account

- Vercel project created for `momentum-app`
- Custom domain configured (e.g., `app.yourdomain.com` or `dashboard.yourdomain.com`)

### 4. Dependencies

Required npm packages:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "@prisma/client": "^6.16.2",
    "next": "15.5.2",
    "react": "19.1.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.10",
    "prisma": "^6.16.2"
  }
}
```

---

## Environment Variables

### Required Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables** (Scope: Production)

```bash
# ============================================================================
# CRITICAL: Must Match Marketing Site
# ============================================================================

# JWT Secret - MUST BE IDENTICAL to marketing site
# Generate with: openssl rand -base64 32
JWT_SECRET=your-exact-same-jwt-secret-from-marketing-site-32-chars-min

# Database - MUST BE SAME as marketing site (shared user database)
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/momentum?sslmode=require

# ============================================================================
# Dashboard-Specific Configuration
# ============================================================================

# Dashboard App URL (this app's production domain)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Marketing Site URL (for logout redirects and CORS)
NEXT_PUBLIC_MARKETING_URL=https://yourdomain.com

# ============================================================================
# Optional
# ============================================================================

# Direct database connection (for Prisma Migrate)
DIRECT_URL=postgresql://user:password@host.region.aws.neon.tech/momentum?sslmode=require

# Session secret (if using encrypted cookies)
SESSION_SECRET=another-random-32-char-secret

# Environment
NODE_ENV=production
```

### Environment Variable Validation

Create `src/lib/env.ts`:

```typescript
/**
 * Environment Variable Validation for Dashboard App
 * Validates all required variables at application startup
 */

interface ValidationResult {
  success: boolean
  errors: string[]
}

function validateEnvironment(): ValidationResult {
  const errors: string[] = []

  // Skip validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return { success: true, errors: [] }
  }

  // JWT_SECRET - Must match marketing site
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET is required and must be at least 32 characters (must match marketing site)')
  }

  // DATABASE_URL - Must be same as marketing site
  if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
    errors.push('DATABASE_URL is required and must be a valid PostgreSQL connection string (shared with marketing site)')
  }

  // Dashboard URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is required (e.g., https://app.yourdomain.com)')
  }

  // Marketing URL
  if (!process.env.NEXT_PUBLIC_MARKETING_URL) {
    errors.push('NEXT_PUBLIC_MARKETING_URL is required (e.g., https://yourdomain.com)')
  }

  return {
    success: errors.length === 0,
    errors
  }
}

// Run validation at module load
const validationResult = validateEnvironment()

if (!validationResult.success) {
  console.error('\n❌ Environment Validation Failed\n')
  validationResult.errors.forEach(error => console.error(`  • ${error}`))
  console.error('\nPlease check your environment variables in Vercel dashboard.\n')
  throw new Error('Environment validation failed')
}

// Export validated environment variables
export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

export const JWT_SECRET = env.JWT_SECRET
```

---

## Database Requirements

### Prisma Schema

The dashboard app MUST have access to the User and Account models from the marketing site.

**Option A**: Copy the schema (recommended for independence)

Create `prisma/schema.prisma`:

```prisma
// Prisma schema for momentum-app
// Matches marketing site schema for shared database access

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================================
// Shared Models (from marketing site)
// ============================================================================

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

  // Add dashboard-specific relations here if needed
  // e.g., projects      Project[]
  // e.g., settings      UserSettings?

  @@map("users")
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
  @@map("verification_tokens")
}

// ============================================================================
// Dashboard-Specific Models (add your models here)
// ============================================================================

// Example:
// model Project {
//   id          String   @id @default(cuid())
//   name        String
//   userId      String
//   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
// }
```

**Option B**: Use same schema file (symlink or shared package)

### Prisma Client Setup

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton
 * Prevents multiple instances in development (hot reload)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Database Migrations

After setting up the schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (or use migrate deploy)
npx prisma db push
```

**Note**: Since the database is shared with the marketing site, the User/Account/Session/VerificationToken tables already exist. Only new dashboard-specific tables need to be created.

---

## JWT Token Specification

### Token Structure

The marketing site generates JWT tokens with this exact structure:

```typescript
{
  user: {
    id: string,        // User ID from database (cuid format)
    email: string,     // User email address
    name: string       // User name (or email username if name is null)
  },
  exp: number,         // Expiration timestamp (7 days from issue)
  iat: number          // Issued at timestamp
}
```

### Token Properties

- **Algorithm**: HS256 (HMAC SHA-256)
- **Signing Key**: `JWT_SECRET` environment variable
- **Expiration**: 7 days (604800 seconds)
- **Claims**:
  - `user.id` - User database ID (CUID string)
  - `user.email` - User email (validated)
  - `user.name` - User display name (or email prefix if null)
  - `exp` - Expiration timestamp (Unix epoch)
  - `iat` - Issued at timestamp (Unix epoch)

### Token Validation Logic

Create `src/lib/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/env'

/**
 * JWT Token Payload (from marketing site)
 */
export interface JWTPayload {
  user: {
    id: string
    email: string
    name: string
  }
  exp: number
  iat: number
}

/**
 * Validate JWT token from marketing site
 *
 * @param token - JWT token string
 * @returns Decoded payload if valid, null if invalid/expired
 */
export function validateJWT(token: string): JWTPayload | null {
  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 10, // Allow 10 seconds clock drift
    }) as JWTPayload

    // Validate payload structure
    if (
      !decoded.user ||
      typeof decoded.user.id !== 'string' ||
      typeof decoded.user.email !== 'string' ||
      typeof decoded.user.name !== 'string'
    ) {
      console.error('Invalid JWT payload structure')
      return null
    }

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired:', error.message)
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification failed:', error.message)
    } else {
      console.error('Unexpected JWT error:', error)
    }
    return null
  }
}

/**
 * Check if JWT token is expired (without verifying signature)
 * Useful for debugging
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null
    if (!decoded?.exp) return true
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
```

---

## Required Implementations

### 1. Auth Callback Route Handler

Create the route that receives the JWT token from the marketing site.

**File**: `src/app/dashboard/auth/route.ts` (or `page.tsx` if using client-side)

#### Server-Side Approach (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateJWT } from '@/lib/jwt'
import { createSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/**
 * GET /dashboard/auth?token={jwt}
 *
 * Receives JWT token from marketing site, validates it, creates dashboard session
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  // 1. Validate token exists
  if (!token) {
    console.error('Auth callback: No token provided')
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_MARKETING_URL}/login?error=no_token`
    )
  }

  // 2. Validate JWT token
  const payload = validateJWT(token)
  if (!payload) {
    console.error('Auth callback: Invalid or expired token')
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_MARKETING_URL}/login?error=invalid_token`
    )
  }

  try {
    // 3. Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
      },
    })

    if (!user) {
      console.error(`Auth callback: User ${payload.user.id} not found in database`)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_MARKETING_URL}/login?error=user_not_found`
      )
    }

    // 4. Create dashboard session
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

    await createSession(response, {
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      image: user.image,
    })

    // 5. Redirect to dashboard (token cleared from URL)
    console.log(`Auth callback: User ${user.email} authenticated successfully`)
    return response

  } catch (error) {
    console.error('Auth callback: Database error', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_MARKETING_URL}/login?error=auth_failed`
    )
  }
}
```

#### Client-Side Approach (Alternative)

**File**: `src/app/dashboard/auth/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      router.push('/login?error=no_token')
      return
    }

    // Validate token and create session via API
    fetch('/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Clear token from URL and redirect to dashboard
          router.replace('/dashboard')
        } else {
          router.push(`/login?error=${data.error || 'auth_failed'}`)
        }
      })
      .catch((err) => {
        console.error('Auth validation error:', err)
        router.push('/login?error=auth_failed')
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  )
}
```

**Corresponding API Route**: `src/app/api/auth/validate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateJWT } from '@/lib/jwt'
import { createSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'no_token' },
      { status: 400 }
    )
  }

  const payload = validateJWT(token)
  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'invalid_token' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'user_not_found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ success: true })

    await createSession(response, {
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      image: user.image,
    })

    return response
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}
```

### 2. Session Management

#### Option A: Cookie-Based Sessions (Recommended)

Create `src/lib/session.ts`:

```typescript
import { NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/lib/env'

/**
 * Session Data Structure
 */
export interface SessionData {
  userId: string
  email: string
  name: string
  image: string | null
}

/**
 * Session Configuration
 */
const SESSION_CONFIG = {
  cookieName: 'session',
  maxAge: 7 * 24 * 60 * 60, // 7 days (matches JWT expiry)
  secret: new TextEncoder().encode(env.SESSION_SECRET || env.JWT_SECRET),
}

/**
 * Create encrypted session cookie
 */
export async function createSession(
  response: NextResponse,
  sessionData: SessionData
): Promise<void> {
  // Create JWT for session
  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SESSION_CONFIG.secret)

  // Set HTTP-only cookie
  response.cookies.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_CONFIG.maxAge,
    path: '/',
  })
}

/**
 * Get session from cookie
 */
export async function getSession(
  request: Request
): Promise<SessionData | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [key, ...v] = c.split('=')
      return [key, v.join('=')]
    })
  )

  const token = cookies[SESSION_CONFIG.cookieName]
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SESSION_CONFIG.secret)
    return payload as SessionData
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

/**
 * Delete session cookie
 */
export function deleteSession(response: NextResponse): void {
  response.cookies.delete(SESSION_CONFIG.cookieName)
}
```

**Note**: This uses `jose` library for session encryption. Install it:

```bash
npm install jose
```

#### Option B: Database Sessions

```typescript
// src/lib/session.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export interface SessionData {
  userId: string
  email: string
  name: string
  image: string | null
}

/**
 * Create database session
 */
export async function createSession(
  response: NextResponse,
  sessionData: SessionData
): Promise<void> {
  // Generate session token
  const sessionToken = randomBytes(32).toString('hex')

  // Create session in database
  await prisma.session.create({
    data: {
      sessionToken,
      userId: sessionData.userId,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  // Set session cookie
  response.cookies.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

/**
 * Get session from database
 */
export async function getSession(
  request: Request
): Promise<SessionData | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [key, ...v] = c.split('=')
      return [key, v.join('=')]
    })
  )

  const sessionToken = cookies['session_token']
  if (!sessionToken) return null

  // Find session in database
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  })

  // Validate session exists and not expired
  if (!session || session.expires < new Date()) {
    return null
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name || session.user.email.split('@')[0],
    image: session.user.image,
  }
}

/**
 * Delete session
 */
export async function deleteSession(
  response: NextResponse,
  sessionToken: string
): Promise<void> {
  await prisma.session.delete({
    where: { sessionToken },
  })
  response.cookies.delete('session_token')
}
```

### 3. Protected Routes Middleware

Create `middleware.ts` in project root:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

/**
 * Middleware to protect dashboard routes
 * Redirects unauthenticated users to marketing site login
 */
export async function middleware(request: NextRequest) {
  // Check if route is protected
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Allow auth callback route (needs to process before auth check)
    if (request.nextUrl.pathname === '/dashboard/auth') {
      return NextResponse.next()
    }

    // Check session
    const session = await getSession(request)

    if (!session) {
      // Redirect to marketing site login
      const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL
      return NextResponse.redirect(`${marketingUrl}/login?redirect=dashboard`)
    }
  }

  return NextResponse.next()
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    // Exclude public assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 4. Logout Handler

**API Route**: `src/app/api/auth/logout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

/**
 * POST /api/auth/logout
 *
 * Clears dashboard session and redirects to marketing site
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Delete session
  deleteSession(response)

  return response
}

/**
 * GET /api/auth/logout
 *
 * Logout via GET (for simple links)
 */
export async function GET(request: NextRequest) {
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL
  const response = NextResponse.redirect(`${marketingUrl}/?logout=success`)

  deleteSession(response)

  return response
}
```

**Client Component** (for logout button):

```typescript
'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })

      // Redirect to marketing site
      window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL || '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <button onClick={handleLogout} className="btn btn-secondary">
      Sign Out
    </button>
  )
}
```

### 5. User Session Hook

Create a React hook for accessing session data:

**File**: `src/hooks/use-session.ts`

```typescript
'use client'

import { useEffect, useState } from 'react'

export interface User {
  id: string
  email: string
  name: string
  image: string | null
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch session:', err)
        setLoading(false)
      })
  }, [])

  return { user, loading }
}
```

**API Route**: `src/app/api/auth/session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: session })
}
```

---

## Vercel Deployment Configuration

### 1. Environment Variables Setup

In **Vercel Dashboard → momentum-app Project → Settings → Environment Variables**:

Add all variables from the [Environment Variables](#environment-variables) section.

**Important**: Set scope to **Production** for production values, **Preview** for testing values.

### 2. Custom Domain Configuration

1. **Add Domain**:
   - Vercel Dashboard → Domains
   - Add: `app.yourdomain.com` (or `dashboard.yourdomain.com`)

2. **Configure DNS** (at domain registrar):
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

3. **Update Environment Variable**:
   - Set `NEXT_PUBLIC_APP_URL=https://app.yourdomain.com`

4. **Verify HTTPS**:
   - Vercel automatically provisions SSL certificate
   - Wait for DNS propagation (usually < 1 hour)

### 3. Vercel Configuration File

Create `vercel.json` (optional, for advanced configuration):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### 4. Build Configuration

Ensure these settings in **Vercel Dashboard → Project Settings → Build & Development**:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next (default)
Install Command: npm install
Node.js Version: 20.x
```

### 5. Update Marketing Site

In the **marketing site** (`momentum` repo), update the environment variable:

```bash
NEXT_PUBLIC_DASHBOARD_URL=https://app.yourdomain.com
```

Redeploy the marketing site for changes to take effect.

---

## Security Requirements

### 1. HTTPS Enforcement

- ✅ **Automatic on Vercel** - All traffic forced to HTTPS
- ✅ **Verify**: Custom domain has valid SSL certificate
- ✅ **Action**: Set `secure: true` on cookies in production

### 2. Token Security

- ✅ **Single-use tokens** - Clear token from URL immediately after validation
- ✅ **Short expiry** - 7-day maximum (already configured)
- ✅ **Secure transmission** - Only via HTTPS
- ⚠️ **Token in URL** - Security risk minimized by immediate clearing

### 3. Session Security

- ✅ **HttpOnly cookies** - Not accessible via JavaScript
- ✅ **Secure flag** - HTTPS-only in production
- ✅ **SameSite: Lax** - CSRF protection
- ✅ **7-day expiry** - Matches token expiry

### 4. CSRF Protection

For state-changing operations (logout, settings updates):

```typescript
// Generate CSRF token
import { randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

// Validate CSRF token
export function validateCSRFToken(token: string, expected: string): boolean {
  return token === expected
}
```

Store CSRF token in session and validate on POST requests.

### 5. Rate Limiting

Install and configure rate limiting on auth endpoints:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
  analytics: true,
})
```

Apply to auth routes:

```typescript
// In /dashboard/auth/route.ts
const identifier = request.ip || 'anonymous'
const { success } = await authRateLimit.limit(identifier)

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  )
}
```

### 6. Error Handling

Never expose internal details in error messages:

```typescript
// ❌ Bad
return NextResponse.json({ error: error.message }, { status: 500 })

// ✅ Good
console.error('Internal error:', error)
return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
```

### 7. Security Headers

Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
      ],
    },
  ]
}
```

---

## Testing Guide

### Manual Testing Checklist

#### Local Testing (Development)

1. **Environment Setup**:
   ```bash
   # Copy from marketing site
   JWT_SECRET=same-as-marketing-site
   DATABASE_URL=same-as-marketing-site
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
   ```

2. **Start Both Apps**:
   ```bash
   # Terminal 1: Marketing site
   cd momentum
   npm run dev  # Port 3000

   # Terminal 2: Dashboard app
   cd momentum-app
   npm run dev  # Port 3001
   ```

3. **Test Flow**:
   - [ ] Go to `http://localhost:3000/login`
   - [ ] Sign in with Google OAuth
   - [ ] Verify redirect to `http://localhost:3001/dashboard/auth?token=...`
   - [ ] Verify token cleared and redirected to `/dashboard`
   - [ ] Verify session persists on refresh
   - [ ] Test logout flow

#### Production Testing

1. **Deploy Both Apps**:
   - [ ] Marketing site deployed to `https://yourdomain.com`
   - [ ] Dashboard app deployed to `https://app.yourdomain.com`

2. **Verify Environment Variables**:
   - [ ] `JWT_SECRET` matches in both apps
   - [ ] `DATABASE_URL` matches in both apps
   - [ ] `NEXT_PUBLIC_DASHBOARD_URL` set correctly in marketing site
   - [ ] `NEXT_PUBLIC_APP_URL` set correctly in dashboard app

3. **Test Authentication Flow**:
   - [ ] Visit `https://yourdomain.com/login`
   - [ ] Sign in with Google OAuth
   - [ ] Verify redirect to `https://app.yourdomain.com/dashboard/auth?token=...`
   - [ ] Verify redirect to `https://app.yourdomain.com/dashboard`
   - [ ] Check browser DevTools:
     - [ ] Session cookie set (HttpOnly, Secure, SameSite=Lax)
     - [ ] No JWT token visible in Application → Storage
     - [ ] No console errors

4. **Test Error Cases**:
   - [ ] Invalid token → Redirect to login
   - [ ] Expired token → Redirect to login
   - [ ] No token → Redirect to login
   - [ ] Logout → Clear session, redirect to marketing site

5. **Test Protected Routes**:
   - [ ] Try accessing `/dashboard` without auth → Redirect to login
   - [ ] Access `/dashboard` with valid session → Success
   - [ ] Access API routes without auth → 401 Unauthorized

### Automated Testing

Create tests for critical flows:

**File**: `__tests__/auth/jwt-validation.test.ts`

```typescript
import { validateJWT } from '@/lib/jwt'
import jwt from 'jsonwebtoken'

describe('JWT Validation', () => {
  const validSecret = process.env.JWT_SECRET || 'test-secret-32-characters-long'

  it('validates a valid JWT token', () => {
    const token = jwt.sign(
      {
        user: { id: 'test-id', email: 'test@example.com', name: 'Test User' },
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      },
      validSecret
    )

    const payload = validateJWT(token)
    expect(payload).not.toBeNull()
    expect(payload?.user.email).toBe('test@example.com')
  })

  it('rejects an expired token', () => {
    const token = jwt.sign(
      {
        user: { id: 'test-id', email: 'test@example.com', name: 'Test User' },
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200,
      },
      validSecret
    )

    const payload = validateJWT(token)
    expect(payload).toBeNull()
  })

  it('rejects a token with invalid signature', () => {
    const token = jwt.sign(
      {
        user: { id: 'test-id', email: 'test@example.com', name: 'Test User' },
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      },
      'wrong-secret'
    )

    const payload = validateJWT(token)
    expect(payload).toBeNull()
  })
})
```

Run tests:

```bash
npm test
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid or expired token" Error

**Symptoms**:
- Users redirected back to login immediately
- Console shows JWT verification errors

**Causes**:
- `JWT_SECRET` mismatch between apps
- Token expired (rare, 7-day expiry)
- Token corrupted in URL

**Solutions**:
1. Verify `JWT_SECRET` is identical in both apps:
   ```bash
   # In both Vercel dashboards
   echo $JWT_SECRET
   ```
2. Check token expiry in browser DevTools → Network tab
3. Test with freshly generated token
4. Check for URL encoding issues

#### 2. "User not found in database"

**Symptoms**:
- User authenticated on marketing site but not found on dashboard

**Causes**:
- Different databases (not shared)
- Database connection issue
- User record not synced

**Solutions**:
1. Verify `DATABASE_URL` is identical in both apps
2. Check database connection:
   ```bash
   npx prisma db pull
   ```
3. Query user directly:
   ```typescript
   await prisma.user.findUnique({ where: { email: 'test@example.com' } })
   ```

#### 3. Session Not Persisting

**Symptoms**:
- User logged out on page refresh
- Session cookie not set

**Causes**:
- Cookie not created properly
- `secure` flag in development (HTTP)
- SameSite issues

**Solutions**:
1. Check cookie settings:
   ```typescript
   secure: process.env.NODE_ENV === 'production', // Must be false in dev
   sameSite: 'lax', // Not 'strict'
   ```
2. Verify cookie in DevTools → Application → Cookies
3. Check for HTTPS in production

#### 4. CORS Errors

**Symptoms**:
- Browser blocks redirect
- "CORS policy" errors in console

**Causes**:
- Mixed content (HTTP → HTTPS)
- Cross-origin cookie issues

**Solutions**:
1. Ensure both apps use HTTPS in production
2. Verify domains are configured correctly
3. Check browser console for specific CORS errors

#### 5. Rate Limit Exceeded

**Symptoms**:
- 429 Too Many Requests
- Users can't authenticate

**Causes**:
- Rate limiting too aggressive
- Bot attacks
- Multiple failed attempts

**Solutions**:
1. Increase rate limit for auth endpoints
2. Implement exponential backoff
3. Whitelist trusted IPs
4. Add CAPTCHA for suspicious activity

#### 6. Environment Variables Not Loading

**Symptoms**:
- App crashes on startup
- "JWT_SECRET is required" error

**Causes**:
- Variables not set in Vercel
- Wrong scope (Preview vs Production)
- Typo in variable name

**Solutions**:
1. Verify all variables in Vercel dashboard
2. Check scope matches deployment type
3. Redeploy after adding new variables
4. Use `vercel env pull` to test locally

### Debug Tools

#### 1. JWT Debugger

Use [jwt.io](https://jwt.io) to inspect token payload:
- Copy token from URL
- Paste into debugger
- Verify signature (use your JWT_SECRET)
- Check expiry timestamp

#### 2. Database Query

Test database connection:

```typescript
// In a test API route
export async function GET() {
  const users = await prisma.user.findMany({ take: 5 })
  return NextResponse.json({ users })
}
```

#### 3. Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Production logs
vercel logs production

# Function logs (specific route)
# Vercel Dashboard → Deployments → Function Logs
```

#### 4. Network Tab

In browser DevTools → Network:
- Check redirect chain
- Verify token in URL
- Check cookie headers
- Look for 401/403 errors

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in Vercel
- [ ] `JWT_SECRET` matches marketing site exactly
- [ ] `DATABASE_URL` matches marketing site (shared database)
- [ ] Custom domain configured (`app.yourdomain.com`)
- [ ] Marketing site updated with `NEXT_PUBLIC_DASHBOARD_URL`
- [ ] Prisma schema synced with marketing site
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)

### Post-Deployment

- [ ] Visit `https://app.yourdomain.com` → Verify homepage loads
- [ ] Test full auth flow from marketing site
- [ ] Verify session persists on refresh
- [ ] Test logout flow
- [ ] Check Vercel function logs for errors
- [ ] Verify database has session records (if using database sessions)
- [ ] Test protected routes (with and without auth)

### Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor Vercel Analytics
- [ ] Watch database usage (Neon dashboard)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create alerts for high error rates

---

## Additional Resources

### Documentation Links

- [NextAuth.js Documentation](https://authjs.dev)
- [JWT.io Debugger](https://jwt.io)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon PostgreSQL Docs](https://neon.tech/docs)

### Marketing Site Repository

The marketing site (`momentum` repo) contains:
- NextAuth v5 configuration
- JWT token generation logic
- Shared Prisma schema
- Email templates

Refer to these files:
- `src/lib/auth.ts` - JWT generation function
- `prisma/schema.prisma` - Database schema
- `src/lib/env.ts` - Environment validation

### Support

For issues specific to this integration:
1. Check this document first
2. Review marketing site documentation (`CLAUDE.md`, `docs/`)
3. Test JWT validation with [jwt.io](https://jwt.io)
4. Check Vercel function logs
5. Verify environment variables match exactly

---

**Version History**:
- v1.0.0 (January 2025) - Initial version

**Maintained by**: Momentum Team
**Last Review**: January 2025
