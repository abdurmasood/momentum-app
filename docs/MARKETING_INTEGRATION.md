# Marketing Site Integration Guide

This document outlines everything the `momentum-web` (marketing site) repository needs to integrate with the `momentum-app` (dashboard) repository.

---

## 🎯 Overview

The marketing site (`momentum-web`) handles:
- Landing pages and marketing content
- User authentication (login/signup)
- Redirecting authenticated users to the dashboard

The dashboard app (`momentum-app`) handles:
- Receiving authentication tokens
- Validating and storing tokens
- Displaying the dashboard interface

---

## 📋 Prerequisites for Marketing Site

### 1. **Required Routes**

The marketing site MUST implement these routes:

```
/                    → Homepage/Landing page
/features            → Features page (optional)
/pricing             → Pricing page (optional)
/login               → Login page (REQUIRED)
/signup              → Signup page (REQUIRED)
/forgot-password     → Password reset (optional)
```

---

## 🔐 Authentication Implementation

### 1. **JWT Token Generation**

After successful login/signup, the marketing site must generate a JWT token with this structure:

```javascript
// JWT Payload Structure
{
  user: {
    id: "user-id-123",           // User's unique ID
    email: "user@example.com",   // User's email
    name: "John Doe",            // User's name (optional)
    // Add any other user data you need
  },
  exp: 1735689600,               // Token expiration (Unix timestamp)
  iat: 1704067200                // Token issued at (Unix timestamp)
}
```

**Example JWT generation (Node.js):**

```javascript
import jwt from 'jsonwebtoken';

// After successful authentication
const user = {
  id: authenticatedUser.id,
  email: authenticatedUser.email,
  name: authenticatedUser.name
};

const token = jwt.sign(
  { 
    user,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    iat: Math.floor(Date.now() / 1000)
  },
  process.env.JWT_SECRET // Your secret key
);
```

---

### 2. **Redirect to Dashboard After Auth**

After successful login/signup, redirect the user to the dashboard with the token:

```javascript
// In your login/signup success handler
const handleAuthSuccess = (token) => {
  // Option A: Redirect to marketing site dashboard URL (recommended)
  window.location.href = `${window.location.origin}/dashboard/auth?token=${token}`;
  // This becomes: https://trymomentum.ai/dashboard/auth?token=jwt_token
  
  // Option B: Direct redirect to dashboard app URL (if not using proxy)
  // window.location.href = `https://momentum-app.vercel.app/dashboard/auth?token=${token}`;
};
```

**Complete Example:**

```javascript
// pages/login.tsx or app/login/page.tsx
async function handleLogin(email, password) {
  try {
    // 1. Authenticate user with your backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      // 2. Redirect to dashboard with token
      window.location.href = `${window.location.origin}/dashboard/auth?token=${data.token}`;
    } else {
      // Handle error
      setError('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('An error occurred');
  }
}
```

---

## 🔗 Vercel Configuration

### **Add Rewrite Rule**

Create or update `momentum-web/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://momentum-b79s4kgwq-abdurmasoods-projects.vercel.app/dashboard/:path*"
    }
  ]
}
```

**Important:** Replace the destination URL with your actual dashboard deployment URL.

This makes `trymomentum.ai/dashboard` seamlessly proxy to the dashboard app.

---

## 🧪 Testing the Integration

### **Local Testing Setup**

1. **Run both apps locally:**

```bash
# Terminal 1: Marketing site
cd momentum-web
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Dashboard app
cd momentum-app
PORT=3001 npm run dev
# Runs on http://localhost:3001
```

2. **Update marketing site for local testing:**

```javascript
// In your auth success handler, check environment
const dashboardUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001'
  : window.location.origin;

window.location.href = `${dashboardUrl}/dashboard/auth?token=${token}`;
```

3. **Test the flow:**
   - Go to `http://localhost:3000/login`
   - Enter credentials
   - Should redirect to `http://localhost:3001/dashboard/auth?token=...`
   - Dashboard validates token and redirects to `/dashboard`

---

## 📝 Environment Variables

Add these to your marketing site:

```env
# .env.local (development)
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
JWT_SECRET=your-super-secret-key-here

# .env.production (production)
NEXT_PUBLIC_DASHBOARD_URL=https://trymomentum.ai
JWT_SECRET=your-super-secret-key-here
```

---

## 🔄 Complete Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  User visits trymomentum.ai                                     │
│         ↓                                                       │
│  Clicks "Login" or "Sign Up"                                    │
│         ↓                                                       │
│  trymomentum.ai/login or /signup                                │
│         ↓                                                       │
│  [Marketing Site] User enters credentials                       │
│         ↓                                                       │
│  [Marketing Backend] Validates credentials                      │
│         ↓                                                       │
│  [Marketing Backend] Generates JWT token                        │
│         ↓                                                       │
│  [Marketing Frontend] Redirects to:                             │
│    trymomentum.ai/dashboard/auth?token=jwt_token                │
│         ↓                                                       │
│  [Vercel Rewrite] Proxies to dashboard app:                     │
│    momentum-app.vercel.app/dashboard/auth?token=jwt_token       │
│         ↓                                                       │
│  [Dashboard] Receives token in /dashboard/auth page            │
│         ↓                                                       │
│  [Dashboard] Validates JWT token:                               │
│    - Checks format (3 parts)                                    │
│    - Checks expiration                                          │
│    - Decodes user data                                          │
│         ↓                                                       │
│  [Dashboard] Stores token:                                      │
│    - localStorage.setItem('momentum_auth_token', token)         │
│    - document.cookie (for server-side access)                   │
│         ↓                                                       │
│  [Dashboard] Redirects to /dashboard                            │
│         ↓                                                       │
│  User sees: trymomentum.ai/dashboard                            │
│         ↓                                                       │
│  [Dashboard] AuthProvider checks token on every page load       │
│         ↓                                                       │
│  ✅ Token valid → Dashboard loads                               │
│  ❌ No token/expired → Redirects to trymomentum.ai/login        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ API Reference

### **Expected Token Format**

The dashboard expects tokens in this format:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMTIzIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0sImV4cCI6MTczNTY4OTYwMCwiaWF0IjoxNzA0MDY3MjAwfQ.signature

Structure: [header].[payload].[signature]
```

**Minimum Required Payload Fields:**

```json
{
  "user": {
    "id": "string",      // REQUIRED
    "email": "string"    // REQUIRED
  },
  "exp": 1234567890      // REQUIRED (Unix timestamp)
}
```

---

## 🚨 Security Considerations

### **DO:**
- ✅ Use HTTPS in production
- ✅ Set short token expiration (7 days max)
- ✅ Use secure, random JWT_SECRET
- ✅ Validate user credentials properly
- ✅ Hash passwords with bcrypt
- ✅ Use HTTPS-only cookies when possible

### **DON'T:**
- ❌ Store passwords in JWT payload
- ❌ Use predictable JWT secrets
- ❌ Send tokens over HTTP
- ❌ Use tokens that never expire
- ❌ Include sensitive data in tokens

---

## 📞 Integration Checklist

Before launching, ensure:

- [ ] Login page implemented at `/login`
- [ ] Signup page implemented at `/signup`
- [ ] JWT token generation working
- [ ] Token includes user data and expiration
- [ ] Redirect to `/dashboard/auth?token=...` after auth
- [ ] Vercel rewrite configured in `vercel.json`
- [ ] Environment variables set
- [ ] Local testing completed
- [ ] Production deployment tested
- [ ] Token expiration handling working

---

## 🐛 Troubleshooting

### **Issue: Dashboard shows "Authentication failed"**

**Possible causes:**
1. Token format is incorrect (must be 3 parts separated by `.`)
2. Token is expired (`exp` field is in the past)
3. Token payload is malformed

**Debug steps:**
```javascript
// Decode token to check payload
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Expires:', new Date(payload.exp * 1000));
```

### **Issue: Infinite redirect loop**

**Cause:** Dashboard redirects to login, login redirects to dashboard

**Solution:** Ensure auth success redirects to `/dashboard/auth` (NOT `/dashboard`)

### **Issue: 404 on /dashboard routes**

**Cause:** Vercel rewrite not configured

**Solution:** Add rewrite rule to `momentum-web/vercel.json`

---

## 📚 Example Implementations

### **Next.js App Router (Marketing Site)**

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Redirect to dashboard with token
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';
        window.location.href = `${dashboardUrl}/dashboard/auth?token=${data.token}`;
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 1. Validate credentials (replace with your auth logic)
  const user = await validateUser(email, password);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // 2. Generate JWT token
  const token = jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET!
  );

  // 3. Return token
  return NextResponse.json({
    success: true,
    token
  });
}
```

---

## 🎉 Success Criteria

Your integration is successful when:

1. ✅ User can login/signup on marketing site
2. ✅ After auth, user is automatically redirected to dashboard
3. ✅ Dashboard loads without errors
4. ✅ User stays logged in when refreshing page
5. ✅ User is redirected to login when accessing dashboard without auth
6. ✅ URLs show `trymomentum.ai/dashboard` (not vercel URL)

---

## 📖 Additional Resources

- [Dashboard App Repository](https://github.com/abdurmasood/momentum-app)
- [Dashboard Deployment Guide](../DEPLOYMENT.md)
- [JWT.io - Token Debugger](https://jwt.io)
- [Vercel Rewrites Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)

---

**Questions?** Open an issue in the dashboard repository or refer to the deployment documentation.