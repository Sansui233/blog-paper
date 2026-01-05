import { Loader2 } from "lucide-react";

/**
 * Loading skeleton for memos page
 * Used as HydrateFallback when clientLoader is running
 */
export function OverallSkeleton() {
  return (
    <div className="bg-bg-2 flex min-h-screen items-center justify-center">
      <div className="text-text-gray-2 flex flex-col items-center gap-3">
        <Loader2 size={48} className="animate-spin" />
        <span className="text-lg font-medium">Cooking...</span>
        <span className="text-text-gray-3 text-sm">现在，即刻，开始提肛</span>
      </div>
    </div>
  );
}

export default OverallSkeleton;
