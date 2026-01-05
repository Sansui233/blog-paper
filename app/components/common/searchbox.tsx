import useSearch from "app/hooks/use-search";
import type { PostSearchObj } from "lib/data/search.common";
import { POSTS_SEARCH_INDEX_FILE } from "lib/data/search.common";
import type { Match, Result } from "lib/search";
import { debounce } from "lib/throttle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/**
 * Search result type for posts
 */
export interface PostSearchResult extends Result {
  id: string;
  title: string;
  matches: Match[];
}

type Props = {
  outSetSearch: (isShow: boolean) => void;
  outIsShow: boolean;
  iconEle: React.RefObject<HTMLDivElement | null>;
};

function SearchBox({ outSetSearch: outShow, outIsShow, iconEle }: Props) {
  const [res, setRes] = useState<PostSearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initData = useCallback(async () => {
    const response = await fetch(`/data/${POSTS_SEARCH_INDEX_FILE}`);
    const data = (await response.json()) as PostSearchObj[];

    return {
      data,
      fields: ["title", "tags", "description", "keywords", "content"] as Array<
        keyof PostSearchObj
      >,
      buildResult: (
        obj: PostSearchObj,
        matches: Match[],
      ): PostSearchResult => ({
        id: obj.id,
        title: obj.title,
        matches,
      }),
    };
  }, []);

  const { searchStatus, search } = useSearch<PostSearchObj, PostSearchResult>({
    inputRef,
    setRes,
    initData,
  });

  // Debounced search on input
  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        search();
      }, 300),
    [search],
  );

  /**
   * UI control
   */
  const close = useCallback(() => {
    outShow(false);
  }, [outShow]);

  // Click Outside to close & Esc to close
  useEffect(() => {
    if (!outIsShow) return;

    function handleClick(e: MouseEvent) {
      const clickSearchBox =
        containerRef.current && containerRef.current.contains(e.target as Node);
      const clickSearchIcon =
        iconEle.current && iconEle.current.contains(e.target as Node);
      if (!clickSearchBox && !clickSearchIcon) {
        close();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }

    document.addEventListener("pointerdown", handleClick, false);
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("pointerdown", handleClick, false);
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [iconEle, close, outIsShow]);

  // Focus on open
  useEffect(() => {
    if (outIsShow) {
      inputRef.current?.focus();
    }
  }, [outIsShow]);

  // Handle input change - search on typing
  const handleInput = () => {
    debouncedSearch();
  };

  function highlightSlot(s: string, patterns: string | string[] | undefined) {
    if (!patterns) return s;

    if (typeof patterns === "string") {
      patterns = [patterns];
    }

    const regexPattern = new RegExp(`(${patterns.join("|")})`, "gi");
    const matches = s.split(regexPattern);

    return (
      <>
        {matches.map((match, index) => {
          if (regexPattern.test(match)) {
            return (
              <mark key={index} className="text-accent bg-transparent">
                {match}
              </mark>
            );
          } else {
            return <span key={index}>{match}</span>;
          }
        })}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-bg border-ui-line-gray-2 fixed top-13.75 right-0 z-11 m-[0_10px] w-96 overflow-hidden rounded-xl border shadow-[0_0_12px_var(--shadow-bg)] transition-all duration-300 ease-out max-[580px]:max-h-[50%] max-[580px]:w-[96%] ${
        outIsShow
          ? "visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2.5 opacity-0"
      } `}
    >
      {/* Sticky search input */}
      <div className="bg-bg sticky top-0 p-4 pb-0">
        <input
          type="text"
          placeholder="搜索你感兴趣的内容，以空格分词"
          ref={inputRef}
          onInput={handleInput}
          className="bg-bg text-text-primary w-full rounded-none border-none focus:outline-none focus-visible:outline-none"
        />
      </div>

      {/* Scrollable results */}
      <div className="max-h-[60vh] overflow-y-auto px-4 py-2">
        {searchStatus.isSearch === "ready" ? (
          <div className="text-sm opacity-50">
            <div className="text-text-gray overflow-hidden text-sm whitespace-nowrap">
              输入关键词开始搜索
            </div>
          </div>
        ) : searchStatus.isSearch === "searching" ? (
          <div className="text-sm opacity-50">
            <div className="text-text-gray overflow-hidden text-sm whitespace-nowrap">
              搜索中……
            </div>
          </div>
        ) : res.length === 0 ? (
          <div className="text-sm opacity-50">
            <div className="text-text-gray overflow-hidden text-sm whitespace-nowrap">
              没有找到结果
            </div>
          </div>
        ) : (
          res.map((r, i) => {
            const id = r.id.substring(0, r.id.lastIndexOf(".")) || r.id;
            return (
              <Link
                to={`/posts/${id}`}
                key={i}
                onClick={() => close()}
                className="group block py-1.5 pl-4"
              >
                <span className="before:text-accent relative transition-shadow duration-500 group-hover:shadow-[inset_0_-0.5em_0_var(--accent-hover)] before:absolute before:-left-3.5 before:content-['•']">
                  {highlightSlot(
                    r.title,
                    r.matches?.map((e) => e.word),
                  )}
                </span>
                {r.matches?.map(
                  (e) =>
                    e.excerpt && (
                      <div
                        key={e.word}
                        className="text-text-gray overflow-hidden text-sm whitespace-nowrap"
                      >
                        {highlightSlot(e.excerpt, e.word)}
                      </div>
                    ),
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SearchBox;
