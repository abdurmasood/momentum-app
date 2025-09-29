"use client"

import { useEffect, useState } from "react"

/**
 * Specialized loading skeleton for the 3D sphere component
 * Provides a contextual loading experience that matches the final component
 */
export default function Sphere3DLoadingSkeleton() {
  const [loadingStep, setLoadingStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const loadingSteps = [
    "Initializing WebGL context...",
    "Loading shader programs...",
    "Setting up 3D geometry...",
    "Preparing materials...",
    "Ready to render!"
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1
        }
        return 0 // Loop back to start
      })
    }, 800)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0 // Reset progress
        }
        return prev + 2
      })
    }, 50)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [loadingSteps.length])

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="text-center">
        {/* Animated 3D-style loading orb */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="w-40 h-40 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-spin" style={{
              borderTopColor: 'oklch(0.638 0.198 251.37)',
              animationDuration: '3s'
            }}></div>
            
            {/* Middle ring */}
            <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-spin" style={{
              borderRightColor: 'oklch(0.608 0.246 296.88)',
              animationDuration: '2s',
              animationDirection: 'reverse'
            }}></div>
            
            {/* Inner sphere with gradient */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-60 animate-pulse">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Wireframe overlay effect */}
            <div className="absolute inset-6 rounded-full border border-dashed border-blue-400/30 animate-ping" style={{
              animationDuration: '2s'
            }}></div>
          </div>
        </div>

        {/* Loading progress */}
        <div className="mb-6">
          <div className="w-48 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-3">
          <h3 className="text-xl font-light text-slate-100 mb-2">
            Loading <span className="font-medium italic instrument">3D Environment</span>
          </h3>
          
          <p className="text-sm text-slate-300 font-light animate-fade-in">
            {loadingSteps[loadingStep]}
          </p>

          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ambient glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}