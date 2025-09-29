import React from "react"
import { cn } from "@/lib/utils"
import { NAVIGATION_LINKS } from '@/constants/marketing'
import type { NavLinksProps } from "@/types"

/**
 * Navigation links component for marketing pages
 * Renders a horizontal list of navigation links with responsive design
 */
export const NavLinks: React.FC<NavLinksProps> = ({ links = NAVIGATION_LINKS, className = "" }) => {
  return (
    <div className={cn("absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-6", className)}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-gray-300 hover:text-white transition-colors text-sm"
          aria-label={link.ariaLabel}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}