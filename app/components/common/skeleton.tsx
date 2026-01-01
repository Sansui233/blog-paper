// SkeletonLoader.tsx
import { CircleAlert } from 'lucide-react';

// For this snippet to work standalone, use standard template literals, 
// Optional: If you don't have a 'cn' utility, you can simply use template literals or install clsx/tailwind-merge.
// use 'cn' for better class merging.

interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
}

/**
 * Skeleton Loading State
 * Replicates the linear-gradient animation from the original styled-component
 */
export function SkeletonLoading({
  height = '100px',
  width = '100%',
  borderRadius = '0.5rem',
  className
}: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-[linear-gradient(45deg,#55555525_25%,#bbbbbb25_50%,#55555525_75%)] bg-size-[400%_200%] ${className || ''}`}
      style={{
        height,
        width,
        borderRadius,
        // We define the keyframes locally via inline styles for the specific shimmer effect
        // or rely on a custom tailwind config. 
        // Here is a pure inline-style approach for the animation to keep it portable:
        animation: 'shimmer 5s infinite linear',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

interface SkeletonErrorProps extends SkeletonProps {
  text?: string;
}

/**
 * Skeleton Error State
 */
export function SkeletonError({
  height = '100px',
  width = '100%',
  borderRadius = '0.5rem',
  text = 'Load Failed',
  className
}: SkeletonErrorProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-500/15 p-4 text-gray-400/40 ${className || ''}`}
      style={{ height, width, borderRadius }}
    >
      <CircleAlert className="mr-2 inline-block h-6 w-6" />
      <span className="text-xl font-semibold">{text}</span>
    </div>
  );
}
