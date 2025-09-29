"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Trash2, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
// import { useUser } from "@stackframe/stack"; // Available for future use

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // const user = useUser(); // Available for future use

  const handleGoogleCalendarConnect = useCallback(() => {
    if (isConnected) {
      // Handle disconnect
      setIsConnected(false);
    } else {
      // Handle connect - in a real app, this would initiate OAuth
      setIsConnected(true);
    }
  }, [isConnected]);

  const handleDeleteAccount = useCallback(() => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
    } else {
      // Handle account deletion - in a real app, this would call an API
      // user?.delete(); // This would be the actual deletion call
      alert("Account deletion functionality would be implemented here");
      setShowDeleteConfirmation(false);
    }
  }, [showDeleteConfirmation]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <p className="text-muted-foreground">
        Configure your preferences and account settings.
      </p>
      
      <div className="mt-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Account Settings</h3>
          <div className="grid gap-4">
            {/* Google Calendar Connection */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Calendar className="size-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Google Calendar</h4>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? "Connected - Sync your calendar events" 
                        : "Connect your Google Calendar to sync events"
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={handleGoogleCalendarConnect}
                  className="flex items-center gap-2"
                >
                  {isConnected ? (
                    <>
                      <ExternalLink className="size-4" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Calendar className="size-4" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-destructive/10">
                    <Trash2 className="size-4 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      {showDeleteConfirmation 
                        ? "This action cannot be undone. All your data will be permanently deleted."
                        : "Permanently delete your account and all associated data"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {showDeleteConfirmation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="size-4" />
                    {showDeleteConfirmation ? "Confirm Delete" : "Delete Account"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}