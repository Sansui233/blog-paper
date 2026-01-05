import type { MemoInfo, MemoPostJsx, MemoTag } from "lib/data/memos.common";
import {
  MEMO_SEARCH_INDEX_FILE,
  type MemoSearchObj,
} from "lib/data/search.common";
import { toMdxCode } from "lib/md-compile/compile";
import { remarkTag } from "lib/remark/remark-tag";
import { createNaive, type Match, type Result } from "lib/search";
import { Loader2, MenuSquare } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigation, useSearchParams } from "react-router";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { siteInfo } from "site.config";
import { FloatButton } from "~/components/common/FloatButton";
import LayoutContainer from "~/components/common/layout";
import CommentModal from "~/components/memo/CommentModal";
import ImageBrowser from "~/components/memo/ImageBrowser";
import { MemoCard, MemoLoading, type TMemo } from "~/components/memo/MemoCard";
import { OverallSkeleton } from "~/components/memo/MemoSkeleton";
import { Sidebar } from "~/components/memo/Sidebar";
import VirtualList from "~/components/memo/VirtualList";
import { parseSearchQuery } from "~/hooks/use-search";
import type { Route } from "./+types/memos";

const MEMO_CSR_API = "/data/memos";

// --- Type Definitions ---
type LoaderData = {
  memos: MemoPostJsx[];
  info: MemoInfo;
  tags: MemoTag[];
  source: "SSG" | "CSR";
  filterTag?: string;
  searchQuery?: string;
};

// --- 1. SSG Loader (Server/Build Time) ---
export async function loader(): Promise<LoaderData> {
  const path = await import("path");
  const { loadJson } = await import("lib/fs/fs");

  const dataDir = path.join(process.cwd(), "public", "data", "memos");

  const [memos, info, tags] = await Promise.all([
    loadJson(path.join(dataDir, "0.json")) as Promise<MemoPostJsx[]>,
    loadJson(path.join(dataDir, "status.json")) as Promise<MemoInfo>,
    loadJson(path.join(dataDir, "tags.json")) as Promise<MemoTag[]>,
  ]);

  return {
    memos: memos ?? [],
    info: info ?? {
      memos: 0,
      tags: 0,
      imgs: 0,
      pages: 0,
      fileMap: [],
      pageMap: [],
    },
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
  const q = url.searchParams.get("q");

  // No query params -> Reuse SSG data
  if (!q && !tag) {
    return (await serverLoader()) as LoaderData;
  }

  // Fetch common data for CSR operations
  const fetchCommonData = async () => {
    const [info, tags] = await Promise.all([
      fetch(`${MEMO_CSR_API}/status.json`).then((r) =>
        r.json(),
      ) as Promise<MemoInfo>,
      fetch(`${MEMO_CSR_API}/tags.json`).then((r) => r.json()) as Promise<
        MemoTag[]
      >,
    ]);
    return { info, tags };
  };

  // Search result type
  interface MemoSearchResult extends Result {
    id: string;
    content: string;
    tags: string[];
    imgs_md: string[];
    matches: Match[];
  }

  const { info, tags } = await fetchCommonData();

  // Fetch search index
  const searchIndex = (await fetch(`/data/${MEMO_SEARCH_INDEX_FILE}`).then(
    (r) => r.json(),
  )) as MemoSearchObj[];

  // await new Promise((resolve) => setTimeout(resolve, 300000));

  // Determine search patterns and config based on query type
  let patterns: string[];
  let searchConfig: { fields?: Array<keyof MemoSearchObj> } | undefined;

  if (q) {
    // Parse search query with field syntax support
    const parsed = parseSearchQuery<MemoSearchObj>(q);
    patterns = parsed.patterns;
    searchConfig = parsed.config;
  } else {
    // Tag filter: search tags field with exact tag name
    patterns = [tag!];
    searchConfig = { fields: ["tags"] };
  }

  if (patterns.length === 0) {
    return (await serverLoader()) as LoaderData;
  }

  // Create search engine and collect results
  const results: MemoSearchResult[] = [];
  const engine = createNaive<MemoSearchObj, MemoSearchResult>({
    data: searchIndex,
    field: ["tags", "content"],
    notifier: (res) => {
      results.length = 0;
      results.push(...res);
    },
    disableStreamNotify: true,
    buildResult: (obj, matches) => ({
      id: obj.id,
      content: obj.content,
      tags: obj.tags,
      imgs_md: obj.imgs_md,
      matches,
    }),
  });

  await engine.search(patterns, searchConfig);

  // Convert search results to MemoPostJsx (compile markdown to jsx)
  const memos: MemoPostJsx[] = await Promise.all(
    results.map(async (r) => {
      const { code } = await toMdxCode(r.content, {
        remarkPlugins: [remarkGfm, remarkTag],
        rehypePlugins: [rehypeHighlight],
      });
      return {
        id: r.id,
        content_jsx: code,
        tags: r.tags,
        imgs_md: r.imgs_md,
        sourceFile: "",
        csrIndex: [0, 0] as [number, number],
      };
    }),
  );

  return {
    memos,
    info,
    tags,
    source: "CSR",
    filterTag: tag ?? undefined,
    searchQuery: q ?? undefined,
  };
}

// --- 3. Force clientLoader to run on hydration ---
clientLoader.hydrate = true as const;

// --- 4. HydrateFallback (prevents flash of SSG content) ---
export function HydrateFallback() {
  return <OverallSkeleton />;
}

// --- 5. Meta ---
export function meta({}: Route.MetaArgs) {
  return [
    { title: `${siteInfo.author} - Memos` },
    { name: "description", content: "Micro-blogging and short thoughts" },
  ];
}

// --- 6. Main Component ---
export default function MemosPage({ loaderData }: Route.ComponentProps) {
  const {
    memos: loaderMemos,
    info,
    tags,
    source,
    filterTag,
    searchQuery,
  } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileSider, setIsMobileSider] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  }>();

  const navigation = useNavigation();
  const isSearching = navigation.state === "loading";

  const selectedTag = searchParams.get("tag") || filterTag;
  const currentSearchQuery = searchParams.get("q") || searchQuery;
  const isFiltered = source === "CSR" && (!!filterTag || !!searchQuery);

  // Handle tag click - pure CSR navigation
  const handleTagClick = useCallback(
    (tagName: string) => {
      setSearchParams((prev) => {
        if (prev.get("tag") === tagName) {
          prev.delete("tag"); // Toggle off
        } else {
          prev.set("tag", tagName);
        }
        prev.delete("q"); // Clear search when selecting tag
        return prev;
      });
    },
    [setSearchParams],
  );

  // Handle search - sets ?q= param which triggers clientLoader
  const handleSearch = useCallback(
    (query: string) => {
      setSearchParams((prev) => {
        if (query.trim()) {
          prev.set("q", query.trim());
          prev.delete("tag"); // Clear tag when searching
        } else {
          prev.delete("q");
        }
        return prev;
      });
    },
    [setSearchParams],
  );

  // Handle opening comment modal with click position for animation
  const handleOpenComment = useCallback((e: React.MouseEvent) => {
    setClickPosition({ x: e.clientX, y: e.clientY });
    setIsCommentOpen(true);
  }, []);

  // Fetch more memos for infinite scroll (currently only when not filtered)
  const loadMore = useCallback(
    async (
      start: number,
      mode: "next" | "prev",
    ): Promise<TMemo[] | undefined> => {
      if (isFiltered) return undefined; // Don't fetch more when filtered

      const batchsize = 10;
      if (mode === "prev") {
        start = start - batchsize;
      }
      console.debug("%% loadMore at:", start, "mode:", mode);
      const pageStart = Math.floor(start / 10);
      const pageEnd = Math.floor((start + batchsize - 1) / 10);
      const indexStart = start % 10;
      const indexEnd = (start + batchsize - 1) % 10;

      // Check bounds
      if (pageStart < 0 || pageStart > info.pages) return undefined;

      const urls: string[] = [];
      for (let i = pageStart; i <= Math.min(pageEnd, info.pages); i++) {
        urls.push(`${MEMO_CSR_API}/${i}.json`);
      }

      console.debug("%% Fetching memos from:", urls);
      if (urls.length === 0) return undefined;
      const promises = urls.map(async (url) => {
        const res = await fetch(url);
        return res.json() as Promise<MemoPostJsx[]>;
      });

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
    [info.pages, isFiltered],
  );

  return (
    <LayoutContainer
      hidesearch
      hideFooter
      hidePlaceholder
      topBarClassName="border-b border-ui-line-gray-2"
    >
      <div className="bg-bg-2 min-h-screen">
        {/* OneColLayout: max-width 1080px, centered, mobile and tablet full width */}
        <div className="mx-auto max-w-270 max-[780px]:max-w-full">
          {/* Float button - hidden on desktop or tablet (>=780px), shown on mobile */}
          <FloatButton
            Icon={MenuSquare}
            onClick={() => setIsMobileSider((v) => !v)}
            className="hidden max-[780px]:block"
          />

          {/* TwoColLayout: flex row on desktop, column on mobile */}
          <div className="flex flex-col justify-center min-[780px]:flex-row">
            {/* Main column (Col) - flex: 3 1 0, stretches to fill available space */}
            <div
              className={`relative flex w-full flex-[3_1_0] flex-col px-4 pt-18 pb-12 [-ms-overflow-style:none] [scrollbar-width:none] max-[780px]:flex-[1_1_0] max-[580px]:px-0 min-[1080px]:max-w-170 [&::-webkit-scrollbar]:hidden`}
            >
              {/* Filter status - right aligned like PageDescription */}
              {isFiltered && (
                <div className="text-text-gray-2 mr-4 text-right text-sm italic">
                  Results: {loaderData.memos.length} memos
                  <span
                    className="hover:text-accent ml-3.5 cursor-pointer font-bold not-italic"
                    onClick={() => {
                      setSearchParams({});
                    }}
                  >
                    X
                  </span>
                </div>
              )}

              {/* Memo list container */}
              <div className="border-ui-line-gray-2 bg-bg mt-2.5 rounded-lg border shadow-[0_0_12px_0_var(--shadow-bg)] max-[580px]:rounded-none max-[580px]:border-x-0">
                {isSearching ? (
                  // Searching loading state
                  <div className="text-text-gray-2 flex min-h-60 flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin" />
                    <span className="text-text-gray-3 text-center text-sm">
                      <span>诶，被你看到了？</span>
                    </span>
                  </div>
                ) : isFiltered ? (
                  // Filtered view - simple list without virtual scroll
                  <VirtualList<TMemo>
                    key={`${loaderData.filterTag ?? ""}-${loaderData.searchQuery ?? ""}`}
                    id={`${loaderData.filterTag ?? ""}-${loaderData.searchQuery ?? ""}`}
                    className="virtualist *:border-ui-line-gray-2 *:border-b [&>*:first-child>.memocard]:rounded-t-lg max-[580px]:[&>*:first-child>.memocard]:rounded-none [&>*:last-child]:border-b-transparent [&>*:last-child>.memocard]:rounded-b-lg max-[580px]:[&>*:last-child>.memocard]:rounded-none"
                    initialItems={loaderData.memos}
                    Elem={(props) => (
                      <MemoCard
                        source={props.source}
                        onTagClick={handleTagClick}
                        triggerHeightChange={props.triggerHeightChange}
                      />
                    )}
                  />
                ) : (
                  // Normal view - virtual list with infinite scroll
                  <VirtualList<TMemo>
                    id={loaderData.source}
                    key={loaderData.source}
                    className="virtualist *:border-ui-line-gray-2 *:border-b [&>*:first-child>.memocard]:rounded-t-lg max-[580px]:[&>*:first-child>.memocard]:rounded-none [&>*:has(+_div>.memoloading)]:border-b-transparent [&>*:has(+_div>.memoloading)>.memocard]:rounded-b-lg [&>*:last-child>.memocard]:rounded-b-lg max-[580px]:[&>*>.memocard]:rounded-none"
                    initialItems={loaderData.memos}
                    Elem={(props) => (
                      <MemoCard
                        source={props.source}
                        onTagClick={handleTagClick}
                        triggerHeightChange={props.triggerHeightChange}
                      />
                    )}
                    loadMore={loadMore}
                    Loading={MemoLoading}
                  />
                )}
              </div>
            </div>

            {/* Sidebar wrapper - sized by content (max-w-60), not flex ratio */}
            <div className="sticky top-0 flex max-h-screen flex-col">
              <Sidebar
                info={info}
                tags={tags}
                onTagClick={handleTagClick}
                onSearch={handleSearch}
                onOpenComment={handleOpenComment}
                selectedTag={selectedTag}
                searchQuery={currentSearchQuery}
                isMobileSider={isMobileSider}
                onToggle={() => setIsMobileSider((v) => !v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image browser modal */}
      <ImageBrowser />

      {/* Comment modal */}
      <CommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        clickPosition={clickPosition}
      />
    </LayoutContainer>
  );
}
