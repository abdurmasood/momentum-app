"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import DashboardNavigation from "./nav-main";
import { NotificationsPopover } from "./nav-notifications";
import { UserProfile } from "./user-profile";
import { DASHBOARD_NAV_ROUTES, DASHBOARD_PERFORMANCE } from "@/constants/dashboard";
import { getNotificationsSync } from "@/services/notifications.service";
import { SafeComponent } from "@/components/error-boundary";

function DashboardSidebarComponent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Get data from services
  const notifications = getNotificationsSync();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="#" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              Momentum
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DASHBOARD_PERFORMANCE.ANIMATION_DURATION }}
        >
          <SafeComponent>
            <NotificationsPopover notifications={notifications} />
          </SafeComponent>
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <SafeComponent>
          <DashboardNavigation routes={DASHBOARD_NAV_ROUTES} />
        </SafeComponent>
      </SidebarContent>
      <SidebarFooter className="px-2">
        <SafeComponent>
          <UserProfile />
        </SafeComponent>
      </SidebarFooter>
    </Sidebar>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const DashboardSidebar = React.memo(DashboardSidebarComponent);
