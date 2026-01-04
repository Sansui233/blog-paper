import type { MemoInfo, MemoTag } from "lib/data/memos.common";
import { HashIcon, Search, TagIcon, Users, X } from "lucide-react";
import { useRef } from "react";
import { siteInfo } from "site.config";

// MemoSearchBox - Search input for memos
interface MemoSearchBoxProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  defaultValue?: string;
}

export function MemoSearchBox({ onSearch, onFocus, defaultValue }: MemoSearchBoxProps) {
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
    <div
      className="
        mx-4 flex items-center rounded-lg
        border border-ui-line-gray-2 bg-bg
        shadow-[0_0_12px_0_var(--shadow-bg)]
        focus-within:border-accent-hover
      "
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search"
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className="
          ml-4 flex-1 w-0
          border-none bg-inherit
          leading-8 text-text-gray
          focus:outline-none focus-visible:outline-none
          placeholder:text-text-gray-3
        "
      />
      <Search
        size="1.4rem"
        className="mx-2.5 flex-shrink-0 text-ui-line-gray cursor-pointer hover:text-accent"
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
    <section className="mt-6 pl-4 text-text-secondary">
      <div className="py-1 mr-3 border-r-2 border-accent flex items-end">
        <span className="font-semibold mr-1">Memos</span>
        <span className="text-[0.875rem] font-semibold text-text-gray-2">{info.memos}</span>
      </div>
      <div className="py-1 mr-3 border-r-2 border-ui-line-gray flex items-end">
        <span className="font-semibold mr-1">Photos</span>
        <span className="text-[0.875rem] font-semibold text-text-gray-2">{info.imgs}</span>
      </div>
    </section>
  );
}

// CardCommon - Generic card wrapper
interface CardCommonProps extends React.HTMLProps<HTMLDivElement> {
  title: string;
  Icon?: React.ComponentType<{ size?: string | number; style?: React.CSSProperties }>;
}

export function CardCommon({ title, Icon, children, ...otherprops }: CardCommonProps) {
  return (
    <section className="mt-6 px-4 py-2 leading-relaxed text-text-secondary" {...otherprops}>
      <div className="font-semibold uppercase text-sm text-text-gray-2 flex items-center">
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
          className={`inline-block pr-3 cursor-pointer hover:text-accent transition-colors ${selectedTag === t.name ? "text-accent font-semibold" : ""
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
            className="relative font-bold transition-shadow duration-300 text-text-primary hover:shadow-[inset_0_-0.5em_0_var(--accent-hover)]"
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
  selectedTag,
  searchQuery,
  isMobileSider,
  onToggle,
}: SidebarProps) {
  return (
    <div
      className={`
        sticky top-0
        max-w-60
        pt-[83px] pb-16 mx-2 max-[1080px]:mx-0
        h-screen
        overflow-y-auto
        [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden

        max-[780px]:fixed max-[780px]:bottom-0 max-[780px]:left-0 max-[780px]:right-0
        max-[780px]:top-auto max-[780px]:h-[min(66vh,500px)]
        max-[780px]:max-w-none max-[780px]:w-full
        max-[780px]:pt-0 max-[780px]:px-4 max-[780px]:pb-4
        max-[780px]:bg-bg max-[780px]:rounded-t-lg max-[780px]:rounded-b-none
        max-[780px]:border max-[780px]:border-ui-line-gray-2 max-[780px]:border-b-0
        max-[780px]:shadow-float-menu max-[780px]:z-40
        max-[780px]:transition-transform max-[780px]:duration-300 max-[780px]:ease-out
        ${isMobileSider ? "max-[780px]:translate-y-0" : "max-[780px]:translate-y-[105%]"}
      `}
    >
      {/* Mobile close button - only visible on mobile */}
      <div
        className={`
          hidden max-[780px]:flex
          sticky top-0 bg-inherit -translate-y-px
          border-b border-ui-line-gray-2
          font-semibold justify-between items-center
          py-4 pt-4 pb-3 mb-4
          text-text-gray-2 text-base cursor-pointer
          hover:text-accent
          ${isMobileSider ? "" : "invisible"}
        `}
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
    </div>
  );
}

export default Sidebar;