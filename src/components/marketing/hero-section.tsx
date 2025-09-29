"use client"

import React from "react"
import { HeroCTA } from "./hero-cta"
import { cn } from "@/lib/utils"
import { HERO_CONTENT } from '@/constants/marketing'
import type { HeroContentProps } from "@/types"

/**
 * Hero section component for marketing pages
 * Features headline, subtitle, and call-to-action with responsive design
 */
export const HeroSection: React.FC<HeroContentProps> = ({
  headline = HERO_CONTENT.HEADLINE,
  subtitle = HERO_CONTENT.SUBTITLE,
  onCTAClick,
  ctaText = HERO_CONTENT.PRIMARY_CTA,
  showSecondaryCTA = false,
  className = ""
}: HeroContentProps) => {
  const headlineParts = headline.split('\n')

  return (
    <main className={cn("flex flex-col items-start px-12 pt-[15vh] pb-16 min-h-[calc(100vh-80px)]", className)}>
      <div className="max-w-3xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-light leading-tight mb-3 font-sans">
          {headlineParts.map((part, index) => (
            <span key={index}>
              {part}
              {index < headlineParts.length - 1 && <br />}
            </span>
          ))}
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-5 max-w-lg leading-relaxed font-sans">
          {subtitle}
        </p>
        
        <HeroCTA 
          primaryText={ctaText}
          onPrimaryClick={onCTAClick}
          showSecondary={showSecondaryCTA}
        />
      </div>
    </main>
  )
}