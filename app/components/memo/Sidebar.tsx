import type { MemoInfo, MemoTag } from "lib/data/memos.common";
import { HashIcon, Search, TagIcon, Users, X } from "lucide-react";
import { useRef } from "react";
import { siteInfo } from "site.config";
import { CommentCard } from "./CommentCard";

// MemoSearchBox - Search input for memos
interface MemoSearchBoxProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  defaultValue?: string;
}

export function MemoSearchBox({
  onSearch,
  onFocus,
  defaultValue,
}: MemoSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      onSearch(inputRef.current.value);
    }
  };

  const handleSearchClick = () => {
    if (inputRef.current) {
      onSearch(inputRef.current.value);
    }
  };

  return (
    <div className="border-ui-line-gray-2 bg-bg focus-within:border-accent-hover mx-4 flex items-center rounded-lg border shadow-[0_0_12px_0_var(--shadow-bg)]">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search"
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className="text-text-gray placeholder:text-text-gray-3 ml-4 w-0 flex-1 border-none bg-inherit leading-8 focus:outline-none focus-visible:outline-none"
      />
      <Search
        size="1.4rem"
        className="text-ui-line-gray hover:text-accent mx-2.5 shrink-0 cursor-pointer"
        onClick={handleSearchClick}
      />
    </div>
  );
}

// NavCard - Shows memo and photo counts
interface NavCardProps {
  info: MemoInfo;
}

export function NavCard({ info }: NavCardProps) {
  return (
    <section className="text-text-secondary mt-6 pl-4">
      <div className="border-accent mr-3 flex items-end border-r-2 py-1">
        <span className="mr-1 font-semibold">Memos</span>
        <span className="text-text-gray-2 text-[0.875rem] font-semibold">
          {info.memos}
        </span>
      </div>
      <div className="border-ui-line-gray mr-3 flex items-end border-r-2 py-1">
        <span className="mr-1 font-semibold">Photos</span>
        <span className="text-text-gray-2 text-[0.875rem] font-semibold">
          {info.imgs}
        </span>
      </div>
    </section>
  );
}

// CardCommon - Generic card wrapper
interface CardCommonProps extends React.HTMLProps<HTMLDivElement> {
  title: string;
  Icon?: React.ComponentType<{
    size?: string | number;
    style?: React.CSSProperties;
  }>;
}

export function CardCommon({
  title,
  Icon,
  children,
  ...otherprops
}: CardCommonProps) {
  return (
    <section
      className="text-text-secondary mt-6 px-4 py-2 leading-relaxed"
      {...otherprops}
    >
      <div className="text-text-gray-2 flex items-center text-sm font-semibold uppercase">
        {Icon && <Icon size="1em" style={{ marginRight: "0.5em" }} />}
        {title}
      </div>
      <div className="pt-2 text-[0.9rem]">{children}</div>
    </section>
  );
}

// TagsCard - Shows clickable tags
interface TagsCardProps {
  tags: MemoTag[];
  onTagClick: (tagName: string) => void;
  selectedTag?: string | null;
}

export function TagsCard({ tags, onTagClick, selectedTag }: TagsCardProps) {
  return (
    <CardCommon Icon={TagIcon} title="Tags">
      {tags.map((t) => (
        <span
          key={t.name}
          className={`hover:text-accent inline-block cursor-pointer pr-3 leading-relaxed transition-colors ${
            selectedTag === t.name ? "text-accent font-semibold" : ""
          }`}
          onClick={() => onTagClick(t.name)}
        >
          <HashIcon
            size="1rem"
            className="inline opacity-50"
            style={{ paddingRight: "1px" }}
          />
          {t.name}
          {t.memoIds.length > 1 && (
            <span className="opacity-50">({t.memoIds.length})</span>
          )}
        </span>
      ))}
    </CardCommon>
  );
}

// FriendsCard - Shows friend links
export function FriendsCard() {
  if (!siteInfo.friends || siteInfo.friends.length === 0) return null;

  return (
    <CardCommon Icon={Users} title="Friends">
      {siteInfo.friends.map((f, i) => (
        <div key={i}>
          <a
            href={f.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-primary relative transition-shadow duration-300 hover:shadow-[inset_0_-0.5em_0_var(--accent-hover)]"
          >
            {f.name}
          </a>
        </div>
      ))}
    </CardCommon>
  );
}

// Full Sidebar component - single component that transforms on mobile
interface SidebarProps {
  info: MemoInfo;
  tags: MemoTag[];
  onTagClick: (tagName: string) => void;
  onSearch: (query: string) => void;
  onOpenComment: (e: React.MouseEvent) => void;
  selectedTag?: string | null;
  searchQuery?: string | null;
  isMobileSider: boolean;
  onToggle: () => void;
}

export function Sidebar({
  info,
  tags,
  onTagClick,
  onSearch,
  onOpenComment,
  selectedTag,
  searchQuery,
  isMobileSider,
  onToggle,
}: SidebarProps) {
  return (
    <div
      className={`max-[780px]:bg-bg max-[780px]:border-ui-line-gray-2 max-[780px]:shadow-float-menu sticky top-0 mx-2 h-screen max-w-60 overflow-y-auto pt-20.5 pb-16 [-ms-overflow-style:none] [scrollbar-width:none] max-[1080px]:mx-0 max-[780px]:fixed max-[780px]:top-auto max-[780px]:right-0 max-[780px]:bottom-0 max-[780px]:left-0 max-[780px]:z-40 max-[780px]:h-[min(66vh,500px)] max-[780px]:w-full max-[780px]:max-w-none max-[780px]:rounded-t-lg max-[780px]:rounded-b-none max-[780px]:border max-[780px]:border-b-0 max-[780px]:px-4 max-[780px]:pt-0 max-[780px]:pb-4 max-[780px]:transition-transform max-[780px]:duration-300 max-[780px]:ease-out [&::-webkit-scrollbar]:hidden ${isMobileSider ? "max-[780px]:translate-y-0" : "max-[780px]:translate-y-[105%]"} `}
    >
      {/* Mobile close button - only visible on mobile */}
      <div
        className={`border-ui-line-gray-2 text-text-gray-2 hover:text-accent sticky top-0 mb-4 hidden -translate-y-px cursor-pointer items-center justify-between border-b bg-inherit py-4 pt-4 pb-3 text-base font-semibold max-[780px]:flex ${isMobileSider ? "" : "invisible"} `}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span>小小の菜单</span>
        <X size="1.25em" className="ml-2" />
      </div>

      <MemoSearchBox onSearch={onSearch} defaultValue={searchQuery ?? ""} />
      <NavCard info={info} />
      <TagsCard tags={tags} onTagClick={onTagClick} selectedTag={selectedTag} />
      <FriendsCard />
      <CommentCard onOpenComment={onOpenComment} />
    </div>
  );
}

export default Sidebar;
