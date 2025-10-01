"use client"

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/shared/sidebar/app-sidebar";
import { WaveLoader } from "@/components/ui/wave-loader";
import { useUser } from "@/hooks/use-user";

export default function DashboardNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <WaveLoader />
      </div>
    );
  }

  // Render dashboard UI
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
