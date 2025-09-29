"use client"

import React from "react"
import { LogoBrand } from "./logo-brand"
import { NavLinks } from "./nav-links"
import { AuthButtons } from "./auth-buttons"
import { cn } from "@/lib/utils"
import type { NavigationProps } from "@/types"

/**
 * Main navigation component for marketing pages
 * Includes logo, navigation links, and authentication buttons
 */
export const Navigation: React.FC<NavigationProps> = ({ onSignIn, onDownload, className = "" }) => {
  return (
    <nav className={cn("flex items-center justify-between px-12 py-2", className)}>
      <LogoBrand />
      <NavLinks />
      <AuthButtons onSignIn={onSignIn} onDownload={onDownload} />
    </nav>
  )
}