/**
 * Marketing constants and configuration
 * Centralized storage for all marketing-related static data
 */

import type { NavLink } from '@/types'

/**
 * Brand information
 */
export const BRAND = {
  NAME: 'Momentum',
  TAGLINE: 'Plan your day, extraordinarily simple.',
  DESCRIPTION: 'Momentum helps you organize your day with focus and clarity.',
  COPYRIGHT: `© ${new Date().getFullYear()} Momentum. All rights reserved.`,
} as const

/**
 * Social media links
 * Update these constants to reflect your actual social media presence
 */
export const SOCIAL_LINKS = {
  TWITTER: 'https://x.com/arafeymasood',
  INSTAGRAM: 'https://instagram.com/momentum',
  GITHUB: 'https://github.com/momentum',
  LINKEDIN: 'https://linkedin.com/company/momentum',
} as const

/**
 * Navigation links for main navigation
 */
export const NAVIGATION_LINKS: NavLink[] = [
  { 
    href: '#features', 
    label: 'Features',
    ariaLabel: 'Learn about Momentum features'
  },
  { 
    href: '#pricing', 
    label: 'Pricing',
    ariaLabel: 'View pricing plans'
  },
  { 
    href: '#resources', 
    label: 'Resources',
    ariaLabel: 'Browse resources and documentation'
  },
]

/**
 * Footer link sections
 * Organized by category for easy maintenance
 */
export const FOOTER_LINKS = {
  ABOUT_US: [
    { title: 'Pricing', href: '#pricing' },
    { title: 'Testimonials', href: '#testimonials' },
    { title: 'FAQs', href: '#faqs' },
    { title: 'Contact Us', href: '#contact' },
    { title: 'Blog', href: '#blog' },
  ],
  SUPPORT: [
    { title: 'Help Center', href: '#help' },
    { title: 'Terms', href: '#terms' },
    { title: 'Privacy', href: '#privacy' },
    { title: 'Security', href: '#security' },
    { title: 'Cookie Policy', href: '#cookies' },
  ],
  COMMUNITY: [
    { title: 'Forum', href: '#forum' },
    { title: 'Events', href: '#events' },
    { title: 'Partners', href: '#partners' },
    { title: 'Affiliates', href: '#affiliates' },
    { title: 'Career', href: '#career' },
  ],
  PRESS: [
    { title: 'Investors', href: '#investors' },
    { title: 'Terms of Use', href: '#terms-of-use' },
    { title: 'Privacy Policy', href: '#privacy-policy' },
    { title: 'Cookie Policy', href: '#cookie-policy' },
    { title: 'Legal', href: '#legal' },
  ],
} as const

/**
 * Hero section content
 */
export const HERO_CONTENT = {
  HEADLINE: BRAND.TAGLINE,
  SUBTITLE: BRAND.DESCRIPTION,
  PRIMARY_CTA: 'Download for macOS ↓',
  SECONDARY_CTA: 'Learn More',
} as const

/**
 * Button text constants
 */
export const BUTTON_TEXT = {
  SIGN_IN: 'Sign in',
  DOWNLOAD: 'Download',
  LEARN_MORE: 'Learn More',
  GET_STARTED: 'Get Started',
} as const

/**
 * Marketing page metadata
 */
export const PAGE_METADATA = {
  TITLE: `${BRAND.NAME} - ${BRAND.TAGLINE}`,
  DESCRIPTION: BRAND.DESCRIPTION,
  KEYWORDS: ['productivity', 'planning', 'task management', 'focus', 'organization'],
  OG_IMAGE: '/images/og-image.png',
  TWITTER_CARD: 'summary_large_image',
} as const

/**
 * Analytics and tracking
 * These use environment variables since IDs differ between dev/staging/production
 */
export const ANALYTICS = {
  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
} as const
