import type React from "react"

/**
 * Dashboard route group layout
 * Wrapper for authentication and dashboard-specific providers
 * The actual dashboard layout with sidebar is in dashboard/layout.tsx
 */
export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}