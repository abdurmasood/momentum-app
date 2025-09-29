"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HERO_CONTENT, BUTTON_TEXT } from '@/constants/marketing'
import type { CTAProps } from "@/types"

/**
 * Hero Call-to-Action component for marketing pages
 * Supports primary and optional secondary actions with golden ratio proportions
 */
export const HeroCTA: React.FC<CTAProps> = ({
  primaryText = HERO_CONTENT.PRIMARY_CTA,
  onPrimaryClick,
  showSecondary = false,
  secondaryText = BUTTON_TEXT.LEARN_MORE,
  onSecondaryClick,
  className = ""
}: CTAProps) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <Button 
        size="golden-hero-lg"
        className={cn(
          "bg-gray-200 text-black hover:bg-gray-300",
          "rounded-md" // Keep your custom rounded corners
        )}
        onClick={onPrimaryClick}
      >
        {primaryText}
      </Button>
      {showSecondary && (
        <Button 
          variant="outline"
          size="golden-hero-lg"
          className={cn(
            "border-gray-600 text-white hover:bg-gray-800",
            "rounded-md" // Keep your custom rounded corners
          )}
          onClick={onSecondaryClick}
        >
          {secondaryText}
        </Button>
      )}
    </div>
  )
}