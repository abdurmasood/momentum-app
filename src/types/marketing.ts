/**
 * Shared TypeScript types for marketing components
 * Ensures consistency and reusability across the marketing module
 */

/**
 * Standard component props that most marketing components accept
 */
export interface MarketingComponentProps {
  /** Optional CSS class name for styling customization */
  className?: string
}

/**
 * Navigation link structure for consistent link handling
 */
export interface NavLink {
  /** URL or anchor link target */
  href: string
  /** Display text for the link */
  label: string
  /** Optional external link indicator */
  external?: boolean
  /** Optional aria-label for accessibility */
  ariaLabel?: string
}

/**
 * Standard button handler type for consistent event handling
 */
export type ButtonClickHandler = () => void | Promise<void>

/**
 * Props for components that handle authentication actions
 */
export interface AuthActionProps extends MarketingComponentProps {
  /** Handler for sign in action */
  onSignIn?: ButtonClickHandler
  /** Handler for download action */
  onDownload?: ButtonClickHandler
  /** Custom text for sign in button */
  signInText?: string
  /** Custom text for download button */
  downloadText?: string
}

/**
 * Props for CTA (Call to Action) components
 */
export interface CTAProps extends MarketingComponentProps {
  /** Primary action text */
  primaryText?: string
  /** Primary action handler */
  onPrimaryClick?: ButtonClickHandler
  /** Whether to show secondary action */
  showSecondary?: boolean
  /** Secondary action text */
  secondaryText?: string
  /** Secondary action handler */
  onSecondaryClick?: ButtonClickHandler
}

/**
 * Props for hero section components
 */
export interface HeroContentProps extends MarketingComponentProps {
  /** Main headline text (supports \n for line breaks) */
  headline?: string
  /** Subtitle/description text */
  subtitle?: string
  /** CTA button text */
  ctaText?: string
  /** CTA click handler */
  onCTAClick?: ButtonClickHandler
  /** Whether to show secondary CTA */
  showSecondaryCTA?: boolean
}

/**
 * Props for navigation components
 */
export interface NavigationProps extends MarketingComponentProps {
  /** Sign in click handler */
  onSignIn?: ButtonClickHandler
  /** Download click handler */
  onDownload?: ButtonClickHandler
}

/**
 * Props for link list components
 */
export interface NavLinksProps extends MarketingComponentProps {
  /** Array of navigation links */
  links?: NavLink[]
}

/**
 * Props for brand/logo components
 */
export interface LogoBrandProps extends MarketingComponentProps {
  /** Optional text styling class */
  textClassName?: string
}