# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Architecture Overview

**Momentum** is a Next.js 15.5 application built with React 19 and TypeScript that showcases WebGL shader effects and interactive graphics. It uses Stack Auth for authentication and features a modern dashboard interface.

### Key Technologies
- **Frontend**: Next.js 15.5 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4.x with Radix UI components
- **Authentication**: Stack Auth (@stackframe/stack)
- **Testing**: Jest with React Testing Library

### Project Structure

#### Authentication System
- Uses Stack Auth with centralized route configuration in `src/constants/routes.ts`
- Auth handler at `/handler/[...stack]` manages all authentication flows
- Routes are typed and organized by category (PUBLIC_ROUTES, AUTH_ROUTES, DASHBOARD_ROUTES)
- Stack configuration in `src/stack.tsx` defines URL mappings and redirects

#### Dashboard Architecture
- Protected dashboard routes under `/dashboard/*`
- Sidebar navigation with collapsible sections
- Layout uses SidebarProvider for state management
- Dynamic imports for Stack Auth components to optimize bundle size

#### Component Organization
- `components/ui/` - Radix UI based components (Button, Avatar, Sidebar, etc.)
- `components/layout/` - Layout-specific components (Header, Sidebar navigation)
- `components/features/` - Feature-specific components (Auth preloader, Chat)
- `components/visualization/` - 3D and shader components
- `components/icons/` - Custom icon components

#### State & Performance
- Performance monitoring with Web Vitals tracking
- Shader-based background effects with error fallbacks
- Rate limiting and debouncing utilities
- Theme color management with observers

#### Testing Strategy
- Jest with jsdom environment for component testing
- React Testing Library for user interaction testing
- Coverage includes accessibility, hooks, utilities, and components
- Tests organized to mirror source structure

### Development Notes

#### Route Management
- All routes defined in `src/constants/routes.ts` with type safety
- Helper functions for programmatic navigation
- Route validation utilities (isProtectedRoute, isAuthRoute, etc.)
