# Momentum Dashboard Deployment Guide

## Strategy A: Independent Vercel Deployment

This dashboard app deploys independently and is proxied through the marketing site.

---

## 📋 Prerequisites

- GitHub account connected to Vercel
- Vercel CLI installed: `npm i -g vercel`
- This repo pushed to GitHub: `abdurmasood/momentum-app`

---

## 🚀 Step 1: Deploy Dashboard to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `momentum-app` repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Click **Deploy**

### Option B: Via CLI

```bash
# From this directory
npx vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: momentum-app
# - Directory: ./
# - Override settings? No

# Deploy to production
npx vercel --prod
```

---

## 🌐 Step 2: Get Your Deployment URL

After deployment, you'll get a URL like:
```
https://momentum-app-[unique-id].vercel.app
```

**Test your dashboard:**
- Visit: `https://momentum-app-[unique-id].vercel.app/dashboard`
- Should redirect to dashboard homepage ✅
- Test auth handler: `https://momentum-app-[unique-id].vercel.app/dashboard/auth?token=test`

---

## 🔗 Step 3: Connect to Marketing Site

In your **`momentum-web`** repository, add this rewrite configuration:

### Create/Update `momentum-web/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://momentum-app-[unique-id].vercel.app/dashboard/:path*"
    }
  ]
}
```

**Replace `[unique-id]`** with your actual Vercel deployment URL!

---

## 🔄 Complete Auth Flow

Once both apps are deployed:

```
1. User visits: trymomentum.ai
2. User signs up: trymomentum.ai/signup
3. Marketing site authenticates user
4. Redirects to: trymomentum.ai/dashboard/auth?token=jwt_token
5. Vercel proxies request to: momentum-app-xyz.vercel.app/dashboard/auth?token=jwt_token
6. Dashboard validates token and redirects to: /dashboard
7. User sees: trymomentum.ai/dashboard (seamlessly!)
```

---

## 🎯 Marketing Site Integration

In your marketing site's login/signup success handler:

```javascript
// After successful authentication
const token = authResponse.jwt;

// Redirect to dashboard with token
window.location.href = `${window.location.origin}/dashboard/auth?token=${token}`;
// This becomes: trymomentum.ai/dashboard/auth?token=jwt
```

---

## 🔧 Environment Variables (Optional)

Add these in Vercel dashboard → Settings → Environment Variables:

```env
NODE_ENV=production
NEXT_PUBLIC_MARKETING_URL=https://trymomentum.ai
```

---

## ✅ Testing Checklist

### Dashboard App (Independent)
- [ ] `momentum-app-xyz.vercel.app/` redirects to `/dashboard`
- [ ] `momentum-app-xyz.vercel.app/dashboard` loads
- [ ] `momentum-app-xyz.vercel.app/dashboard/auth?token=test` processes token
- [ ] All dashboard routes work: `/dashboard/deep-work`, `/dashboard/plan`, etc.

### Marketing Site (After Rewrite)
- [ ] `trymomentum.ai/dashboard` loads dashboard
- [ ] `trymomentum.ai/dashboard/auth?token=test` works
- [ ] Login flow redirects properly
- [ ] URLs show `trymomentum.ai/dashboard` (not vercel URL)

---

## 🐛 Troubleshooting

### Issue: 404 on dashboard routes
**Solution:** Check vercel.json rewrite syntax. Ensure `:path*` is used.

### Issue: Auth token not being received
**Solution:** 
1. Check marketing site is redirecting to correct URL
2. Verify token is in URL query params
3. Check browser console for errors in `/dashboard/auth` page

### Issue: CORS errors
**Solution:** This shouldn't happen with Vercel rewrites (they're server-side proxies), but if it does, add CORS headers in dashboard's `next.config.ts`.

### Issue: Redirect loops
**Solution:** Check that root page redirects to `/dashboard` not just `/`

---

## 📱 Custom Domain (Optional)

If you want a custom domain for the dashboard:

1. In Vercel dashboard → Settings → Domains
2. Add: `app.trymomentum.ai` (subdomain approach)
3. Update marketing site rewrite to use new domain
4. Update `MARKETING_ROUTES` in `src/constants/routes.ts`

---

## 🔄 Updates & Redeployment

Vercel auto-deploys on git push:

```bash
git add .
git commit -m "Update dashboard"
git push

# Vercel will automatically deploy to production
```

---

## 📊 Monitoring

Check deployment status:
- Vercel Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- View logs, analytics, and performance metrics

---

**Need help?** Check the [Next.js deployment docs](https://nextjs.org/docs/deployment) or [Vercel docs](https://vercel.com/docs).