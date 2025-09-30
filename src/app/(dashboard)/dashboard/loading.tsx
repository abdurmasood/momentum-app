import { WaveLoader } from '@/components/ui/wave-loader';

/**
 * Dashboard loading state
 * 
 * Shown automatically by Next.js when navigating to dashboard routes
 * or when suspense boundaries are triggered.
 */
export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <WaveLoader />
    </div>
  );
}