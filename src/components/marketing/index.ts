/**
 * Marketing component exports
 * Includes both components and their TypeScript types for external use
 */

// Main Components
export { Navigation } from "./navigation"
export { HeroSection } from "./hero-section"
export { Footer } from "./footer"

// Atomic Components
export { LogoBrand } from "./logo-brand"
export { NavLinks } from "./nav-links"
export { AuthButtons } from "./auth-buttons"
export { HeroCTA } from "./hero-cta"

// Re-export types for components that need them
export type {
  NavigationProps,
  HeroContentProps,
  LogoBrandProps,
  NavLinksProps,
  AuthActionProps,
  CTAProps,
  NavLink,
  ButtonClickHandler,
} from "@/types"
