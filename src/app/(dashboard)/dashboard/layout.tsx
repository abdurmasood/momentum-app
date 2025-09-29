"use client"

import type React from "react";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/shared/sidebar/app-sidebar";
import { WaveLoader } from "@/components/ui/wave-loader";

export default function DashboardNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <WaveLoader />
      </div>
    );
  }

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