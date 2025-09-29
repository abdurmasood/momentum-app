/**
 * Application route constants
 * 
 * Centralized route definitions for the Momentum dashboard application.
 * Deployed at: trymomentum.ai/dashboard/*
 */

/**
 * External marketing routes
 */
export const MARKETING_ROUTES = {
  HOME: "https://trymomentum.ai",
  LOGIN: "https://trymomentum.ai/login",
  SIGNUP: "https://trymomentum.ai/signup",
} as const;

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = {
  HOME: "/dashboard",
  AUTH_HANDLER: "/dashboard/auth", // Handles tokens from marketing site
} as const;

/**
 * Authentication routes - removed login/signup
 */
export const AUTH_ROUTES = {
} as const;

/**
 * Dashboard routes - protected routes requiring authentication
 */
export const DASHBOARD_ROUTES = {
  ROOT: "/dashboard",
  DEEP_WORK: "/dashboard/deep-work",
  PLAN: "/dashboard/plan", 
  TASKS: "/dashboard/tasks",
  SETTINGS: "/dashboard/settings",
  CHAT: "/dashboard/chat",
  PROFILE: "/dashboard/profile",
  ANALYTICS: "/dashboard/analytics",
} as const;

/**
 * API routes - for internal API calls
 */
export const API_ROUTES = {
  BASE: "/api",
  AUTH: "/api/auth",
  USER: "/api/user",
  NOTIFICATIONS: "/api/notifications",
  TEAMS: "/api/teams",
  ANALYTICS: "/api/analytics",
} as const;

/**
 * All routes combined for easy access
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  API: API_ROUTES,
} as const;

/**
 * Route path helpers for programmatic navigation
 */
export const getRoutePath = {
  dashboard: (subRoute?: keyof typeof DASHBOARD_ROUTES) => 
    subRoute ? DASHBOARD_ROUTES[subRoute] : DASHBOARD_ROUTES.ROOT,
  
  
  api: (apiRoute: keyof typeof API_ROUTES) => API_ROUTES[apiRoute],
} as const;

/**
 * Route validation helpers
 */
export const isProtectedRoute = (path: string): boolean => {
  return path.startsWith(DASHBOARD_ROUTES.ROOT);
};

export const isAuthRoute = (_path: string): boolean => {
  return false; // No auth routes available
};

export const isPublicRoute = (path: string): boolean => {
  return Object.values(PUBLIC_ROUTES).includes(path as PublicRoute);
};

/**
 * Default redirect routes
 */
export const REDIRECT_ROUTES = {
  AFTER_SIGN_OUT: MARKETING_ROUTES.HOME, // Redirect to marketing site after logout
  UNAUTHORIZED: MARKETING_ROUTES.LOGIN,   // Redirect to login page when unauthorized
} as const;

/**
 * Type definitions for type-safe routing
 */
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type DashboardRoute = typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES];
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];
export type AnyRoute = PublicRoute | AuthRoute | DashboardRoute | ApiRoute;