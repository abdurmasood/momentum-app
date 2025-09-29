# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Momentum** is a modern Next.js application showcasing beautiful WebGL shader effects and smooth animations. Built with React 19, TypeScript, and Next.js 15.5, it leverages cutting-edge web technologies to create immersive visual experiences through shader-based graphics and performance-optimized rendering.

Key Technologies:
- **Next.js 15.5** with App Router architecture and Turbopack
- **React 19** with concurrent features
- **TypeScript 5** for type safety
- **WebGL Shaders** via `@paper-design/shaders-react`
- **Three.js** (`@react-three/fiber`, `@react-three/drei`) for 3D rendering
- **Tailwind CSS 4.x** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Performance Analysis
- `npm run analyze` - Basic bundle analysis
- `npm run analyze:browser` - Browser-focused bundle analysis  
- `npm run analyze:server` - Server-focused bundle analysis
- `npm run analyze:both` - Complete bundle analysis

### Testing Specific Components
```bash
# Test shader components
npm test -- --testNamePattern="Sphere3D"

# Test performance utilities
npm test -- --testPathPattern="performance"

# Test UI components  
npm test -- --testPathPattern="components/ui"
```

## Architecture Overview

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard route group
│   ├── (marketing)/        # Marketing route group  
│   ├── layout.tsx          # Root layout with font configuration
│   └── loading.tsx         # Global loading UI
├── components/
│   ├── brand/              # Brand components (logo, etc.)
│   ├── dashboard/          # Dashboard-specific components
│   │   └── deep-work/      # 3D sphere and related components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── config/
│   └── performance.ts      # Centralized performance configuration
├── hooks/
│   ├── use-mobile.ts       # Mobile detection hook
│   └── use-performance-metrics.ts  # Performance monitoring hook
├── lib/
│   └── utils.ts           # Utility functions
├── services/
│   └── notifications.service.ts  # Notification service
├── shaders/
│   └── sphere/            # WebGL shader files (vertex/fragment)
└── utils/
    ├── error-handling.ts  # Centralized error handling
    └── performance-monitor.ts  # Performance monitoring utilities
```

### Key Architectural Patterns

#### Route Groups
The app uses Next.js route groups to organize pages:
- `(dashboard)` - Dashboard and authenticated pages
- `(marketing)` - Landing and marketing pages

#### Performance Monitoring System
The app includes a comprehensive performance monitoring system:
- **Centralized Configuration** (`src/config/performance.ts`) - Environment-based settings
- **Web Vitals Tracking** - FCP, LCP, CLS, FID, TTFB monitoring
- **Custom Metrics** - Shader load times, theme read times, render performance
- **Performance Budgets** - Automated budget violation warnings
- **Error Handling Integration** - Unified error reporting for performance issues

#### WebGL Shader Architecture
- **3D Components** - Located in `src/components/dashboard/deep-work/`
- **Shader Files** - GLSL shaders in `src/shaders/sphere/`
- **Performance Optimized** - WebGL capability detection and fallbacks
- **Configurable** - Extensive configuration options for animation and rendering

#### Component Architecture
- **UI Components** - Shadcn/ui components in `src/components/ui/`
- **Error Boundaries** - App-wide error handling with `src/components/error-boundary.tsx`
- **Loading States** - Consistent loading experiences with wave loader animations

## Development Guidelines

### Performance Considerations
This app is performance-critical due to WebGL rendering:

- Always check WebGL capability before rendering 3D components
- Use the performance monitoring system for tracking render times
- Enable performance debugging with `?perf=true` query parameter
- Monitor shader compilation and update times
- Use React.memo for expensive WebGL components

### WebGL Development
When working with WebGL components:

- Check `src/components/dashboard/deep-work/sphere-3d.tsx` for patterns
- Use performance monitoring hooks for tracking metrics
- Implement proper cleanup in useEffect hooks
- Handle WebGL context loss gracefully
- Provide fallback UI for unsupported devices

### Error Handling
Use the centralized error handling system:

```typescript
import { ErrorHandlers } from '@/utils/error-handling'

// For performance-related errors
ErrorHandlers.handlePerformanceError(error, 'component-name')

// For configuration errors
ErrorHandlers.handleConfigError(error, 'context', metadata)
```

### Performance Configuration
Access performance settings via the configuration system:

```typescript
import { performanceConfig, usePerformanceConfig } from '@/config/performance'

// In React components
const { config, updateConfig, isMetricEnabled } = usePerformanceConfig()

// Outside React
const isEnabled = performanceConfig.isMetricEnabled('shaderMetrics')
```

### Testing Strategy
- **Unit Tests** - Components and utilities with Jest
- **Performance Tests** - Monitor render times and WebGL performance  
- **WebGL Tests** - Test fallbacks and error conditions
- **Integration Tests** - Route navigation and data flow

### Build Optimization
The project uses advanced build optimization:

- **Turbopack** - Fast development builds and hot reload
- **Bundle Analysis** - Multiple analysis modes for optimization
- **Shader Package Splitting** - Separate chunk for WebGL dependencies
- **Performance Monitoring** - Build-time performance tracking

### Font Configuration  
Custom font setup in `src/app/layout.tsx`:
- **Primary** - Figtree (multiple weights)
- **Mono** - Geist Mono  
- **Serif** - Instrument Serif
- **CSS Variables** - Available throughout app as `--font-*`

## Environment-Specific Behavior

### Development Mode
- Performance monitoring enabled by default
- Verbose logging for shader operations
- Bundle analysis available
- Hot reload with Turbopack

### Production Mode  
- Minimal performance monitoring
- Analytics tracking enabled
- Optimized shader chunks
- Advanced webpack optimizations

### Debug Mode
Access with `?perf=true` or `?debug=true`:
- Full performance monitoring
- Detailed console logging
- Budget violation warnings
- Component render tracking