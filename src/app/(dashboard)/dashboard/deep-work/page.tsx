"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";

// Enhanced loading component for better UX
const Sphere3DLoading = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse mb-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/30 mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground">Loading 3D Experience...</p>
    </div>
  </div>
);

// Dynamic import with no SSR for Three.js compatibility
const Sphere3D = dynamic(() => import("@/components/dashboard/deep-work/sphere-3d"), {
  ssr: false,
  loading: Sphere3DLoading,
});

export default function DeepWorkPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Fixed full viewport width to prevent jittering when sidebar changes */}
      <div 
        className="absolute"
        style={{
          width: '100vw',
          height: '100vh',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <ErrorBoundary 
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-400/30 via-orange-500/30 to-yellow-500/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">3D visualization failed to load</p>
              </div>
            </div>
          }
        >
          <Suspense fallback={<Sphere3DLoading />}>
            <Sphere3D 
              className="cursor-pointer" 
              width="100%" 
              height="100%" 
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}