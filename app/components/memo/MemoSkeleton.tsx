/**
 * Loading skeleton for memos page
 * Used as HydrateFallback when clientLoader is running
 */
export function MemoSkeleton() {
  return (
    <div className="bg-bg-2 min-h-screen">
      <div className="mx-auto max-w-270 px-4 pt-20">
        <div className="flex flex-col gap-4 min-[780px]:flex-row">
          {/* Main column skeleton */}
          <div className="flex-[3_1_0] max-[780px]:flex-[1_1_0]">
            <div className="border-ui-line-gray-2 bg-bg rounded-lg border shadow-[0_0_12px_0_var(--shadow-bg)]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-ui-line-gray-2 animate-pulse border-b p-5 last:border-b-0"
                >
                  {/* Avatar and meta */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="bg-ui-line-gray-2 h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-1">
                      <div className="bg-ui-line-gray-2 h-4 w-20 rounded" />
                      <div className="bg-ui-line-gray-3 h-3 w-32 rounded" />
                    </div>
                  </div>
                  {/* Content lines */}
                  <div className="space-y-2 pl-12">
                    <div className="bg-ui-line-gray-2 h-4 w-full rounded" />
                    <div className="bg-ui-line-gray-2 h-4 w-5/6 rounded" />
                    <div className="bg-ui-line-gray-2 h-4 w-4/6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="sticky top-0 max-h-screen flex-1 max-[780px]:hidden">
            <div className="space-y-6 pt-20">
              {/* Nav card skeleton */}
              <div className="space-y-2 pl-4">
                <div className="bg-ui-line-gray-2 h-5 w-24 animate-pulse rounded" />
                <div className="bg-ui-line-gray-3 h-5 w-20 animate-pulse rounded" />
              </div>
              {/* Tags card skeleton */}
              <div className="space-y-2 p-4">
                <div className="bg-ui-line-gray-2 h-4 w-16 animate-pulse rounded" />
                <div className="flex flex-wrap gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="bg-ui-line-gray-3 h-5 w-12 animate-pulse rounded"
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
