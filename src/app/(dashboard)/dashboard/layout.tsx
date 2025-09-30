"use client"

import type React from "react";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/shared/sidebar/app-sidebar";
import { WaveLoader } from "@/components/ui/wave-loader";
import { useUser } from "@/hooks/use-user";

export default function DashboardNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    // Check for auth transition flag from the auth page
    const isAuthTransition = sessionStorage.getItem('momentum_auth_transition');
    
    if (!loading) {
      if (isAuthTransition) {
        // Clear the auth transition flag
        sessionStorage.removeItem('momentum_auth_transition');
      }
      // Show dashboard immediately once loading completes
      setIsInitialized(true);
    }
  }, [loading, user]);

  // Show loading state until everything is ready
  if (!isInitialized || loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <WaveLoader />
      </div>
    );
  }

  // Only render dashboard UI when fully initialized
  return (
    <div className="dark">
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background text-foreground">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
