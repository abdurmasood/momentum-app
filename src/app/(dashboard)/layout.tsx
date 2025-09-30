import type React from "react"

/**
 * Dashboard route group layout
 * 
 * Authentication is handled by middleware (src/middleware.ts)
 * The actual dashboard layout with sidebar is in dashboard/layout.tsx
 */
export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
