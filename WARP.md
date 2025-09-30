# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

# WARP Development Guide for momentum-app

This document provides essential architecture, patterns, and commands for working effectively in the Momentum dashboard application. It helps AI assistants and developers understand the project structure and development workflows.

## Common Development Commands

### Development Server
```bash
npm run dev
```
Start the Next.js development server with Turbopack for faster builds. Runs on http://localhost:3000.

### Build & Production
```bash
npm run build      # Build for production with Turbopack
npm start          # Run production build locally
```

### Testing
```bash
npm test                # Run all tests with Jest
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report
```

### Code Quality
```bash
npm run lint           # Run ESLint on the codebase
```

### Bundle Analysis
```bash
npm run analyze         # Analyze bundle with default settings
npm run analyze:browser # Analyze browser bundle specifically
npm run analyze:server  # Analyze server bundle specifically
npm run analyze:both    # Analyze both client and server bundles
```

## High-Level Architecture

### Framework & Core Technologies
- **Framework**: Next.js 15.5 with App Router and Turbopack
- **UI Library**: React 19 with TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4.x with oklch color space
- **Component Library**: shadcn/ui (New York variant) with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Figtree (sans), Instrument Serif (display), Geist Mono (code)

### Routing Architecture
```
src/app/
├── layout.tsx                    # Root layout with font setup
├── page.tsx                      # Landing/home page
├── loading.tsx                   # Loading state
├── (dashboard)/                  # Route group for dashboard
│   ├── layout.tsx               # Outer layout wrapper
│   └── dashboard/               # Dashboard routes (protected)
│       ├── layout.tsx           # Dashboard layout with sidebar
│       ├── page.tsx             # Dashboard home (Spotlight)
│       ├── deep-work/           # Deep Work page with 3D sphere
│       ├── plan/                # AI planning page with chat
│       ├── tasks/               # Task management
│       ├── settings/            # User settings
│       └── auth/                # Auth token handler
└── middleware.ts                # Route protection middleware
```

**Route Groups**: The `(dashboard)` folder is a Next.js route group that doesn't affect the URL structure but allows nested layouts.

### Authentication System
- **Type**: Token-based authentication (JWT stored in localStorage)
- **Token Key**: `momentum_auth_token`
- **Middleware**: Protects `/dashboard/*` routes (configured in `src/middleware.ts`)
- **Development Mode**: Authentication checks are **bypassed** in `NODE_ENV=development`
- **Marketing Site Integration**: Redirects to `https://trymomentum.ai/login` for unauthenticated users
- **Auth Handler**: `/dashboard/auth` page receives tokens from marketing site

### 3D Graphics & WebGL
- **3D Library**: @react-three/fiber (React renderer for Three.js)
- **Helper Library**: @react-three/drei for common 3D utilities
- **Shaders**: Custom GLSL shaders in `src/shaders/`
  - `sphere/vertex.ts` - Vertex shader with Perlin noise displacement
  - `sphere/fragment.ts` - Fragment shader with theme-coherent colors and Fresnel rim lighting
- **Performance**: WebGL capability detection with graceful fallback UI
- **Main 3D Component**: `src/components/dashboard/deep-work/sphere-3d.tsx`

### Performance Monitoring
- **Configuration**: `src/config/performance.ts` (centralized singleton)
- **Monitor**: `src/utils/performance-monitor.ts` (Web Vitals + custom metrics)
- **Hook**: `src/hooks/use-performance-metrics.ts` for component-level tracking
- **Metrics Tracked**:
  - Web Vitals: FCP, LCP, CLS, FID, TTFB
  - Custom: Shader load time, render time, bundle size
- **Performance Budgets**:
  - FCP/LCP: < 2500ms
  - CLS: < 0.1
  - FID: < 100ms
  - TTFB: < 600ms
  - Shader Load: < 1000ms
  - Render: < 16ms (60fps)

### Component Architecture
```
src/components/
├── ui/                          # shadcn/ui components (button, input, etc.)
├── dashboard/                   # Dashboard-specific components
│   ├── shared/sidebar/         # Sidebar navigation components
│   ├── deep-work/              # Deep Work page components (3D sphere)
│   └── plan/                   # AI planning components
├── auth/                        # Authentication components
│   └── auth-provider.tsx       # Client-side auth wrapper
├── brand/                       # Branding components (logo, etc.)
└── error-boundary.tsx          # Error boundary wrapper
```

### Styling System
- **Design System**: Custom design tokens in `src/app/globals.css` using oklch color space
- **Theme**: Dark theme by default with sophisticated color palette
- **Border Radius**: `--radius: 0.625rem` (10px)
- **Golden Ratio**: Button sizing and layout use golden ratio proportions (per project rules)
- **Utility Function**: `cn()` in `src/lib/utils.ts` for class merging (clsx + tailwind-merge)

### Path Aliases
- `@/*` → `src/*` (configured in `tsconfig.json`)
- Examples: `@/components`, `@/lib/utils`, `@/constants/routes`

## Key Development Patterns

### Route Constants
Centralized route definitions in `src/constants/routes.ts`:
```typescript
import { MARKETING_ROUTES, DASHBOARD_ROUTES } from '@/constants/routes'

// External marketing site URLs
MARKETING_ROUTES.HOME    // https://trymomentum.ai
MARKETING_ROUTES.LOGIN   // https://trymomentum.ai/login

// Dashboard routes (all protected)
DASHBOARD_ROUTES.ROOT       // /dashboard
DASHBOARD_ROUTES.DEEP_WORK  // /dashboard/deep-work
DASHBOARD_ROUTES.PLAN       // /dashboard/plan
```

### Dashboard Navigation
Navigation items configured in `src/constants/dashboard.ts`:
```typescript
import { DASHBOARD_NAV_ROUTES } from '@/constants/dashboard'
// Pre-computed navigation routes with icons
```

### Component Configuration Pattern
Components accept configuration objects with defaults:
```typescript
// Example from Sphere3D component
interface SphereConfig {
  animationSpeed?: number
  sphereIntensity?: number
  sphereScale?: number
  // ... more options
}

// Usage
<Sphere3D config={{ animationSpeed: 0.5 }} />
```

### Performance Monitoring Pattern
```typescript
import { performanceMonitor } from '@/utils/performance-monitor'

// Record custom metrics
performanceMonitor.recordCustomMetric('shaderLoadTime', duration)

// Create performance marks
performanceMonitor.mark('shader-load-start')
performanceMonitor.measure('shader-load', 'shader-load-start')
```

### Error Handling
Centralized error handlers in `src/utils/error-handling.ts`:
```typescript
import { ErrorHandlers } from '@/utils/error-handling'

ErrorHandlers.handlePerformanceError(error, 'component-name')
ErrorHandlers.handleConfigError(error, 'config-update')
```

### Shader Architecture
Shaders are exported as string constants:
```typescript
// src/shaders/sphere/vertex.ts
export const vertexShader = `
  uniform float u_intensity;
  uniform float u_time;
  // ... GLSL code
`
```

### Development Mode Detection
Many features check for development mode:
```typescript
if (process.env.NODE_ENV === 'development') {
  // Development-only logic (auth bypass, verbose logging, etc.)
}
```

## Testing

### Test Configuration
- **Framework**: Jest with Next.js configuration
- **Environment**: jsdom (simulates browser environment)
- **Test Library**: React Testing Library (@testing-library/react)
- **Setup File**: `jest.setup.js` - includes `@testing-library/jest-dom` matchers and mocks for `getComputedStyle`

### Module Resolution
Path aliases (`@/*`) are configured in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Coverage report
```

### Testing Best Practices
- Place test files next to the components they test (co-location)
- Use `.test.ts` or `.test.tsx` extensions
- Mock WebGL-dependent components in tests (Three.js/Canvas components)
- Test user interactions with `@testing-library/user-event`

## Bundle Optimization

### Code Splitting Strategy
Configured in `next.config.ts`:
- **Auth Vendor**: `@stackframe/stack` split into separate chunk
- **Date Utilities**: Lazy-loaded when needed
- **Vendor Chunk**: Common dependencies > 100kb

### Webpack Optimizations
- Cache control headers for `_next/static/*` (immutable, 1 year)
- Preload hints for critical handler resources
- Tree shaking enabled for better bundle size
- Console logs removed in production (except warn/error)

### Performance Optimization
- `optimizePackageImports` for `@stackframe/stack`
- Turbopack for faster builds and HMR
- Image optimization via Next.js built-in

## Important Notes

### WebGL Support
- Components detect WebGL capability via `detectWebGLSupport()`
- Fallback UI shown when WebGL is unavailable
- Loading states while checking support

### Development vs Production Behavior
- **Authentication**: Bypassed in development, enforced in production
- **Performance Logging**: Verbose in development, minimal in production
- **Console Logs**: Preserved in development, stripped in production (except errors/warnings)
- **Bundle Analysis**: Available in development only

### Repository Naming Convention
This project follows the `momentum-*` naming pattern. See `docs/NAMING_CONVENTIONS.md` for full conventions:
- All repositories start with `momentum-`
- Lowercase with hyphen separators
- Example: `momentum-app`, `momentum-api`, `momentum-web`

### Deployment
- **Platform**: Vercel
- **Configuration**: `vercel.json`
- **Root Redirect**: `/` → `/dashboard` (temporary redirect)
- **Build Command**: `npm run build` (uses Turbopack)

### UI Styling Considerations
- **Golden Ratio**: Button sizing and CSS use golden ratio proportions
- **Consistency**: Keep styling consistent between landing page and dashboard
- **Design System**: Use oklch colors from `globals.css` for theme coherence
- **Selection**: Custom text selection colors (amber background, black text)

### Performance Budgets
Monitor these thresholds during development:
- First Contentful Paint: < 2.5s (relaxed for 3D content)
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- Shader Load Time: < 1s
- 60fps target (< 16ms per frame)

### External Dependencies to Note
- `@paper-design/shaders-react`: WebGL shader utilities
- `@stackframe/stack`: Authentication (code-split for bundle optimization)
- `@react-three/fiber` & `@react-three/drei`: 3D rendering
- `framer-motion`: Animations
- `class-variance-authority`: Component variant management

## Project Context

**Momentum** is a productivity dashboard application with beautiful WebGL visualizations. It features:
- Interactive 3D sphere with custom GLSL shaders (Deep Work mode)
- AI-powered planning interface
- Task management
- Performance-optimized rendering
- Integrated with external marketing site (trymomentum.ai) for authentication

The app prioritizes performance, modern web technologies, and sophisticated visual design with a dark theme aesthetic.

---

*For questions about naming conventions or architecture decisions, refer to:*
- `docs/NAMING_CONVENTIONS.md` - Repository naming standards
- `README.md` - Project overview and introduction
- `next.config.ts` - Build configuration and optimizations
- `src/config/performance.ts` - Performance monitoring setup