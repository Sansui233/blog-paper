/**
 * Loading skeleton for memos page
 * Used as HydrateFallback when clientLoader is running
 */
export function MemoSkeleton() {
  return (
    <div className="min-h-screen bg-bg-2">
      <div className="mx-auto max-w-[1080px] px-4 pt-20">
        <div className="flex flex-col min-[780px]:flex-row gap-4">
          {/* Main column skeleton */}
          <div className="flex-[3_1_0] max-[780px]:flex-[1_1_0]">
            <div className="rounded-lg border border-ui-line-gray-2 bg-bg shadow-[0_0_12px_0_var(--shadow-bg)]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 animate-pulse border-b border-ui-line-gray-2 last:border-b-0"
                >
                  {/* Avatar and meta */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-ui-line-gray-2" />
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-20 bg-ui-line-gray-2 rounded" />
                      <div className="h-3 w-32 bg-ui-line-gray-3 rounded" />
                    </div>
                  </div>
                  {/* Content lines */}
                  <div className="pl-12 space-y-2">
                    <div className="h-4 bg-ui-line-gray-2 rounded w-full" />
                    <div className="h-4 bg-ui-line-gray-2 rounded w-5/6" />
                    <div className="h-4 bg-ui-line-gray-2 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="flex-1 sticky top-0 max-h-screen max-[780px]:hidden">
            <div className="pt-20 space-y-6">
              {/* Nav card skeleton */}
              <div className="pl-4 space-y-2">
                <div className="h-5 w-24 bg-ui-line-gray-2 rounded animate-pulse" />
                <div className="h-5 w-20 bg-ui-line-gray-3 rounded animate-pulse" />
              </div>
              {/* Tags card skeleton */}
              <div className="p-4 space-y-2">
                <div className="h-4 w-16 bg-ui-line-gray-2 rounded animate-pulse" />
                <div className="flex flex-wrap gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-5 w-12 bg-ui-line-gray-3 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoSkeleton;