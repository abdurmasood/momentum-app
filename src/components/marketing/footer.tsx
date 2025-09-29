/**
 * Marketing Footer Component
 * Provides site-wide footer with links, social media, and branding
 */

"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { BRAND, SOCIAL_LINKS, FOOTER_LINKS } from '@/constants/marketing'

interface FooterProps {
  className?: string
}

/**
 * Main footer component for marketing pages
 * Features social links, organized link sections, and copyright information
 */
export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn(
        'border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]',
        className,
      )}
    >
      <div className="relative mx-auto max-w-5xl px-3">
        <div className="relative grid grid-cols-1 border-x md:grid-cols-2 md:divide-x">
          {/* Social Media Section - Left */}
          <div>
            <SocialCard title="X" href={SOCIAL_LINKS.TWITTER} />
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x">
              <LinksGroup
                title="About Us"
                links={FOOTER_LINKS.ABOUT_US}
              />
              <LinksGroup
                title="Support"
                links={FOOTER_LINKS.SUPPORT}
              />
            </div>
          </div>

          {/* Social Media Section - Right */}
          <div>
            <SocialCard title="Instagram" href={SOCIAL_LINKS.INSTAGRAM} />
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x">
              <LinksGroup
                title="Community"
                links={FOOTER_LINKS.COMMUNITY}
              />
              <LinksGroup
                title="Press"
                links={FOOTER_LINKS.PRESS}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="flex justify-center border-t py-2 px-4">
        <p className="text-muted-foreground text-[10px]">
          {BRAND.COPYRIGHT}
        </p>
      </div>
    </footer>
  )
}

/**
 * Links group component for footer sections
 */
interface LinksGroupProps {
  title: string
  links: readonly { readonly title: string; readonly href: string }[]
}

const LinksGroup: React.FC<LinksGroupProps> = ({ title, links }) => {
  return (
    <div className="p-1">
      <h3 className="text-foreground/75 mt-1 mb-2 text-[11px] font-medium tracking-wider uppercase">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-[10px] leading-tight transition-colors"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Social media card component with hover effects
 */
interface SocialCardProps {
  title: string
  href: string
}

const SocialCard: React.FC<SocialCardProps> = ({ title, href }) => {
  return (
    <a
      href={href}
      className="hover:bg-accent hover:text-accent-foreground flex items-center justify-center border-t border-b py-1.5 px-3 text-xs md:border-t-0 relative group transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${title} profile`}
    >
      <span className="font-medium">{title}</span>
      <ArrowRight className="h-3 w-3 transition-all absolute right-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
    </a>
  )
}