"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, LogOut, Crown } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { Logo } from "@/components/brand/logo";
import * as React from "react";

function UserProfileComponent() {
  const { isMobile } = useSidebar();
  const user = useUser();
  // Use available Stack Auth user properties
  const displayName = user?.displayName || 
                     user?.primaryEmail || 
                     "User";
  const displayPlan = "Free";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground">
                <Logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayName}
                </span>
                <span className="truncate text-xs">{displayPlan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg mb-4"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuItem 
              className="gap-2 p-2 cursor-pointer"
              onClick={() => {
                // Handle upgrade action - would redirect to billing/upgrade page
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Crown className="size-4 text-yellow-500" />
              </div>
              <div className="font-medium">Upgrade</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 p-2 cursor-pointer"
              onClick={async () => {
                try {
                  await user?.signOut();
                } catch (error) {
                  console.error('Failed to sign out:', error);
                  // Could show a toast notification here in a real app
                }
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <LogOut className="size-4" />
              </div>
              <div className="font-medium">Logout</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Memoized component to prevent re-renders
export const UserProfile = React.memo(UserProfileComponent);
