import { WaveLoader } from "@/components/ui/wave-loader"

export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <WaveLoader />
    </div>
  );
}
