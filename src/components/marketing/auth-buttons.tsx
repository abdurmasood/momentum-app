"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BUTTON_TEXT } from '@/constants/marketing'
import type { AuthActionProps } from "@/types"

/**
 * Authentication buttons component for marketing pages
 * Provides sign in and download actions with golden ratio proportions
 */
export const AuthButtons: React.FC<AuthActionProps> = ({
  onSignIn,
  onDownload,
  signInText = BUTTON_TEXT.SIGN_IN,
  downloadText = BUTTON_TEXT.DOWNLOAD,
  className = ""
}: AuthActionProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button 
        variant="ghost" 
        size="golden"
        className={cn(
          "text-gray-300 hover:text-white hover:bg-gray-800",
          "rounded-md" // Keep your custom rounded corners
        )}
        onClick={onSignIn}
      >
        {signInText}
      </Button>
      <Button 
        size="golden"
        className={cn(
          "bg-gray-200 text-black hover:bg-gray-300",
          "rounded-md" // Keep your custom rounded corners
        )}
        onClick={onDownload}
      >
        {downloadText}
      </Button>
    </div>
  )
}