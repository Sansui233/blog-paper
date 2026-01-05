import type { MemoPostJsx } from "lib/data/memos.common";
import { dateToYMDMM } from "lib/date";
import type { Dispatch, SetStateAction } from "react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { siteInfo } from "site.config";
import useAppState from "~/hooks/use-appstate";
import { MDXContent } from "../markdown/MDXComponent";
import { ImageThumbs } from "./ImageThumbs";

// Memo type with length for collapse calculation
export type TMemo = MemoPostJsx & {
  length?: number;
};

export type MemoCardProps = {
  source: TMemo;
  onTagClick?: (tag: string) => void;
  triggerHeightChange?: Dispatch<SetStateAction<boolean>>;
} & React.HTMLProps<HTMLElement>;

export function MemoCard({
  source,
  onTagClick,
  triggerHeightChange,
  ...otherprops
}: MemoCardProps) {
  const [isCollapse, setIsCollapse] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useAppState();

  const contentLength = source.length ?? undefined;
  const shouldCollapse =
    (contentLength && contentLength > 200) || source.content_jsx!.length > 1000;

  // Parse date from memo id
  const date = useMemo(() => {
    const d = new Date(source.id);
    if (d.toString() !== "Invalid Date") {
      return dateToYMDMM(d);
    } else {
      return source.id;
    }
  }, [source.id]);

  function handleExpand() {
    if (!isCollapse) {
      const element = ref.current;
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < 0 || elementTop > window.innerHeight) {
          globalThis.scrollTo({
            top: elementTop + globalThis.scrollY,
          });
        }
      }
    }
    setIsCollapse(!isCollapse);

    if (ref.current && triggerHeightChange) {
      triggerHeightChange(true);
    }
  }

  const handleClickTag = useCallback(
    (tag: string) => {
      if (onTagClick) {
        const tagName = tag.startsWith("#") ? tag.substring(1) : tag;
        onTagClick(tagName);
      }
    },
    [onTagClick],
  );

  // MDX components with Tag handler
  const mdxComponents = useMemo(
    () => ({
      Tag: MemoTag(handleClickTag),
    }),
    [handleClickTag],
  );

  return (
    <section
      ref={ref}
      className="memocard bg-bg animate-bottom-fade-in p-5 max-[580px]:p-4"
      {...otherprops}
    >
      <div
        className="relative overflow-hidden"
        style={{
          height: shouldCollapse && isCollapse ? "18.2rem" : "auto",
        }}
      >
        {/* Meta info */}
        <div className="flex items-center">
          <img
            className="border-ui-line-gray mr-2 h-10 w-10 rounded-full border"
            src={theme === "light" ? "/avatar-white.png" : "/avatar-black.png"}
            alt={siteInfo.author}
          />
          <div className="flex flex-col items-start">
            <span className="text-text-secondary mr-1 font-semibold">
              {siteInfo.author}
            </span>
            <span className="text-text-gray text-[0.8rem]">{date}</span>
          </div>
          {contentLength && contentLength > 0 && (
            <span className="text-text-gray absolute right-0 text-[0.8rem]">
              {contentLength} 字
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className={`pl-12 ${shouldCollapse ? "pb-8" : ""}`}
          style={{
            lineHeight: "1.625rem",
          }}
        >
          <div className="markdown-wrapper text-text-secondary [&_h1]:text-base [&_h2]:text-base [&_h3]:text-base [&_h4]:text-base [&_h5]:text-base [&_h6]:text-base [&_ol]:leading-relaxed [&_p]:leading-relaxed [&_ul]:leading-relaxed">
            {source.content_jsx && (
              <MDXContent
                code={source.content_jsx}
                components={mdxComponents}
              />
            )}
          </div>
        </div>

        {/* Collapse mask */}
        {shouldCollapse && (
          <div
            className={`text-accent absolute bottom-[-0.25rem] h-28 w-full text-right ${isCollapse ? "bg-mask-gradient" : ""}`}
            style={{ display: shouldCollapse ? "block" : "none" }}
          >
            <div
              onClick={handleExpand}
              className="mt-22 cursor-pointer text-sm tracking-wide"
            >
              <span className="mr-2 transition-shadow duration-300 hover:shadow-[inset_0_-0.5em_0_var(--accent-hover)]">
                {isCollapse ? "展开全文" : "收起"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image thumbnails */}
      {source.imgs_md && source.imgs_md.length > 0 && (
        <ImageThumbs imgs_md={source.imgs_md} />
      )}
    </section>
  );
}

// Tag component for MDX rendering
const MemoTag = (handleClickTag: (tag: string) => void) => {
  // tag does not includes the '#'. see remark-tag.ts
  return function Tag({ text }: { text: string }) {
    return (
      <span
        className="text-accent hover:text-accent-hover cursor-pointer"
        onClick={() => handleClickTag(text)}
      >
        #{text}
      </span>
    );
  };
};

export function MemoLoading() {
  return (
    <section className="memoloading p-4 max-[580px]:p-4">
      <span className="font-bold opacity-35">Loading...</span>
    </section>
  );
}

export default MemoCard;
