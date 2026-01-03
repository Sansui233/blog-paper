import type { MemoPostJsx, MemoTag } from "lib/data/memos.common";
import type { MemoInfoExt } from "lib/data/server/type";
import { loadJson } from "lib/fs/fs";
import { MenuSquare } from "lucide-react";
import path from "path";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { siteInfo } from "site.config";
import { FloatButton } from "~/components/common/FloatButton";
import LayoutContainer from "~/components/common/layout";
import ImageBrowser from "~/components/memo/ImageBrowser";
import { MemoCard, MemoLoading, type TMemo } from "~/components/memo/MemoCard";
import { MemoSkeleton } from "~/components/memo/MemoSkeleton";
import { Sidebar } from "~/components/memo/Sidebar";
import VirtualList from "~/components/memo/VirtualList";
import type { Route } from "./+types/memos";

const MEMO_CSR_API = "/data/memos";

// --- Type Definitions ---
type LoaderData = {
  memos: MemoPostJsx[];
  info: MemoInfoExt;
  tags: MemoTag[];
  source: "SSG" | "CSR";
  filterTag?: string;
};

// --- 1. SSG Loader (Server/Build Time) ---
export async function loader(): Promise<LoaderData> {
  const dataDir = path.join(process.cwd(), "public", "data", "memos");

  const [memos, info, tags] = await Promise.all([
    loadJson(path.join(dataDir, "0.json")) as Promise<MemoPostJsx[]>,
    loadJson(path.join(dataDir, "status.json")) as Promise<MemoInfoExt>,
    loadJson(path.join(dataDir, "tags.json")) as Promise<MemoTag[]>,
  ]);

  console.debug("%% SSG Loader loaded memos:", memos?.length ?? 0);

  return {
    memos: memos ?? [],
    info: info ?? { memos: 0, tags: 0, imgs: 0, pages: 0, fileMap: [], pageMap: [] },
    tags: tags ?? [],
    source: "SSG",
  };
}

// --- 2. Client Loader (Browser) ---
export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");

  // A. If tag query param exists -> CSR filter (fetch all and filter)
  if (tag) {
    const [info, tags] = await Promise.all([
      fetch(`${MEMO_CSR_API}/status.json`).then((r) => r.json()) as Promise<MemoInfoExt>,
      fetch(`${MEMO_CSR_API}/tags.json`).then((r) => r.json()) as Promise<MemoTag[]>,
    ]);

    // Fetch all pages to filter by tag
    const pageCount = info.pages + 1;
    const pagePromises = Array.from({ length: pageCount }, (_, i) =>
      fetch(`${MEMO_CSR_API}/${i}.json`).then((r) => r.json()) as Promise<MemoPostJsx[]>
    );
    const allPages = await Promise.all(pagePromises);
    const allMemos = allPages.flat();

    // Filter by tag
    const filtered = allMemos.filter((m) => m.tags.includes(tag));

    return {
      memos: filtered,
      info,
      tags,
      source: "CSR",
      filterTag: tag,
    };
  }

  // B. No query params -> Reuse SSG data
  return (await serverLoader()) as LoaderData;
}

// --- 3. Force clientLoader to run on hydration ---
clientLoader.hydrate = true as const;

// --- 4. HydrateFallback (prevents flash of SSG content) ---
export function HydrateFallback() {
  return <MemoSkeleton />;
}

// --- 5. Meta ---
export function meta({ }: Route.MetaArgs) {
  return [
    { title: `${siteInfo.author} - Memos` },
    { name: "description", content: "Micro-blogging and short thoughts" },
  ];
}

// --- 6. Main Component ---
export default function MemosPage({ loaderData }: Route.ComponentProps) {
  const { memos: initialMemos, info, tags, source, filterTag } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [memos, setMemos] = useState<TMemo[]>(initialMemos);
  const [isMobileSider, setIsMobileSider] = useState(false);

  const selectedTag = searchParams.get("tag") || filterTag;
  const isFiltered = source === "CSR" && !!filterTag;

  // Handle tag click - pure CSR navigation
  const handleTagClick = useCallback(
    (tagName: string) => {
      setSearchParams((prev) => {
        if (prev.get("tag") === tagName) {
          prev.delete("tag"); // Toggle off
        } else {
          prev.set("tag", tagName);
        }
        return prev;
      });
    },
    [setSearchParams]
  );

  // Fetch more memos for infinite scroll (currently only when not filtered)
  const fetchFrom = useCallback(
    async (start: number, batchsize: number): Promise<TMemo[] | undefined> => {
      if (isFiltered) return undefined; // Don't fetch more when filtered

      const pageStart = Math.floor(start / 10);
      const pageEnd = Math.floor((start + batchsize - 1) / 10);
      const indexStart = start % 10;
      const indexEnd = (start + batchsize - 1) % 10;

      console.debug("%% info.pages:", info.pages);
      // print pageStart and pageEnd and indexStart and indexEnd
      console.debug("%% fetchFrom called with start:", start, "batchsize:", batchsize);
      console.debug("%% Calculated pageStart:", pageStart, "pageEnd:", pageEnd);
      console.debug("%% Calculated indexStart:", indexStart, "indexEnd:", indexEnd);

      // Check bounds
      if (pageStart > info.pages) return undefined;

      const urls: string[] = [];
      for (let i = pageStart; i <= Math.min(pageEnd, info.pages); i++) {
        urls.push(`${MEMO_CSR_API}/${i}.json`);
      }

      console.debug("%% Fetching memos from:", urls);
      if (urls.length === 0) return undefined;
      const promises = urls.map((url) =>
        fetch(url).then((res) => res.json() as Promise<MemoPostJsx[]>)
      );

      const pages = await Promise.all(promises);
      let result = pages.flat();

      // Slice to get exact range
      if (pages.length === 1) {
        result = result.slice(indexStart, indexEnd + 1);
      } else {
        // First page: from indexStart to end
        // Last page: from 0 to indexEnd
        const firstPage = pages[0].slice(indexStart);
        const lastPage = pages[pages.length - 1].slice(0, indexEnd + 1);
        const middlePages = pages.slice(1, -1).flat();
        result = [...firstPage, ...middlePages, ...lastPage];
      }

      return result.length > 0 ? result : undefined;
    },
    [info.pages, isFiltered]
  );

  return (
    <LayoutContainer hidesearch hideFooter hidePlaceholder topBarClassName="border-b border-ui-line-gray-2">
      <div className="min-h-screen bg-bg-2">
        {/* OneColLayout: max-width 1080px, centered, mobile and tablet full width */}
        <div className="mx-auto max-w-[1080px] max-[780px]:max-w-full">
          {/* Float button - hidden on desktop or tablet (>=780px), shown on mobile */}
          <FloatButton
            Icon={MenuSquare}
            onClick={() => setIsMobileSider((v) => !v)}
            className="hidden max-[780px]:block"
          />

          {/* TwoColLayout: flex row on desktop, column on mobile */}
          <div className="flex flex-col min-[780px]:flex-row justify-center">
            {/* Main column (Col) - flex: 3 1 0, stretches to fill available space */}
            <div
              className={`
                relative flex flex-col
                flex-[3_1_0] max-[780px]:flex-[1_1_0]
                w-full
                px-4 max-[780px]:px-0
                pt-[73px] pb-12
                self-end
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
                min-[1080px]:max-w-[680px]
              `}
            >
              {/* Filter status - right aligned like PageDescription */}
              {isFiltered && (
                <div className="mr-4 text-text-gray-2 text-sm italic text-right">
                  Results: {memos.length} memos
                  <span
                    className="not-italic font-bold cursor-pointer ml-3.5 hover:text-accent"
                    onClick={() => {
                      setSearchParams({});
                    }}
                  >
                    X
                  </span>
                </div>
              )}

              {/* Memo list container */}
              <div
                className="rounded-lg border border-ui-line-gray-2 bg-bg shadow-[0_0_12px_0_var(--shadow-bg)] max-[780px]:rounded-none max-[780px]:border-x-0"
                style={{ marginTop: "0.625rem" }}
              >
                {isFiltered ? (
                  // Filtered view - simple list without virtual scroll
                  <VirtualList<TMemo>
                    className="virtualist"
                    sources={memos}
                    setSources={setMemos}
                    Elem={(props) => (
                      <div
                        className={`${props.source === memos[0]
                          ? "[&>section]:rounded-t-lg max-[780px]:[&>section]:rounded-none"
                          : ""
                          } ${props.source === memos[memos.length - 1]
                            ? "[&>section]:rounded-b-lg max-[780px]:[&>section]:rounded-none"
                            : "[&>section]:border-b [&>section]:border-ui-line-gray-2"
                          }`}
                      >
                        <MemoCard
                          source={props.source}
                          onTagClick={handleTagClick}
                          triggerHeightChange={props.triggerHeightChange}
                        />
                      </div>
                    )}
                  />

                ) : (
                  // Normal view - virtual list with infinite scroll
                  <VirtualList<TMemo>
                    className="virtualist"
                    sources={memos}
                    setSources={setMemos}
                    Elem={(props) => (
                      <div
                        className={`${props.source === memos[0]
                          ? "[&>section]:rounded-t-lg max-[780px]:[&>section]:rounded-none"
                          : ""
                          } ${props.source === memos[memos.length - 1]
                            ? "[&>section]:rounded-b-lg max-[780px]:[&>section]:rounded-none"
                            : "[&>section]:border-b [&>section]:border-ui-line-gray-2"
                          }`}
                      >
                        <MemoCard
                          source={props.source}
                          onTagClick={handleTagClick}
                          triggerHeightChange={props.triggerHeightChange}
                        />
                      </div>
                    )}
                    fetchFrom={fetchFrom}
                    batchsize={10}
                    Loading={MemoLoading}
                  />
                )}
              </div>
            </div>

            {/* Sidebar wrapper - sized by content (max-w-60), not flex ratio */}
            <div className="flex flex-col sticky top-0 max-h-screen">
              <Sidebar
                info={info}
                tags={tags}
                onTagClick={handleTagClick}
                selectedTag={selectedTag}
                isMobileSider={isMobileSider}
                onToggle={() => setIsMobileSider((v) => !v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image browser modal */}
      <ImageBrowser />
    </LayoutContainer>
  );
}