"use client"

import { Navigation, HeroSection } from "@/components/marketing"

export default function LandingPage() {
  const handleSignIn = () => {
    // TODO: Implement sign in logic
    console.log('Sign in clicked')
  }

  const handleDownload = () => {
    // TODO: Implement download logic
    console.log('Download clicked')
  }

  const handleCTAClick = () => {
    // TODO: Implement CTA logic
    console.log('CTA clicked')
  }

  return (
    <>
      <Navigation 
        onSignIn={handleSignIn}
        onDownload={handleDownload}
      />
      <HeroSection onCTAClick={handleCTAClick} />
    </>
  )
}
