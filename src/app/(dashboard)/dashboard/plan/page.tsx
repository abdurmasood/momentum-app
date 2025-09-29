"use client";

import { VercelV0Chat } from "@/components/dashboard/plan/ai-chat";

export default function PlanPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <VercelV0Chat />
    </div>
  );
}