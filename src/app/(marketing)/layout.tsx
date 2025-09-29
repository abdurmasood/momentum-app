import type React from "react"
import { Footer } from "@/components/marketing/footer"

/**
 * Marketing route group layout
 * Provides consistent styling and footer for all marketing pages
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
      <Footer />
    </div>
  )
}
