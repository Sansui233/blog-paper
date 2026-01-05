import { X } from "lucide-react";
import "./TableOfContents.css";

type Props = {
  flatItems: {
    title: string;
    id: string;
    depth: number;
  }[];
  currentIndex: number;
  isViewing: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
  onScrollTo: (index: number) => void;
};

export function TableOfContents({
  flatItems,
  currentIndex,
  isViewing,
  isMobileOpen,
  onClose,
  onScrollTo,
}: Props) {
  const isFixedTop = isViewing && !isMobileOpen;

  return (
    <aside
      className={`/* Desktop positioning */ fixed left-[78%] z-20 w-72 max-w-72 overflow-auto transition-[top] duration-300 xl:animate-[fadeInRight_0.3s_ease] ${isFixedTop ? "top-16" : "top-32"} ${isFixedTop ? "max-h-[calc(100vh-4rem)]" : "max-h-[calc(100vh-8rem)]"} /* Tablet: narrower */ /* Mobile: drawer from bottom/right */ max-lg:bg-bg max-lg:shadow-float-menu max-lg:border-ui-line-gray-3 max-xl:left-[76%] max-xl:w-60 max-lg:top-auto max-lg:right-2 max-lg:bottom-34 max-lg:left-auto max-lg:max-h-[calc(100vh-8rem-9rem)] max-lg:w-75 max-lg:rounded-lg max-lg:border max-lg:transition-all max-lg:duration-300 ${
        isMobileOpen
          ? "max-lg:translate-x-0 max-lg:opacity-100"
          : "max-lg:pointer-events-none max-lg:translate-x-full max-lg:opacity-0"
      } /* Small mobile: full width drawer from bottom */ max-sm:right-[2%] max-sm:bottom-0 max-sm:max-h-[60vh] max-sm:w-[96%] max-sm:max-w-none ${
        isMobileOpen
          ? "max-sm:translate-x-0 max-sm:translate-y-0"
          : "max-sm:translate-x-0 max-sm:translate-y-full"
      } `}
    >
      {/* Header */}
      <div className="max-lg:bg-bg sticky top-0 z-10 mb-2 pt-4 pr-4 pb-2 pl-8 text-xl font-bold max-lg:pr-4 max-lg:pl-8">
        目录
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`text-text-gray-2 hover:text-accent float-right hidden cursor-pointer text-[1rem] max-lg:block ${!isMobileOpen && "invisible"} `}
        >
          <X size="1.5em" />
        </button>
      </div>

      {/* Content */}
      <nav className="pr-4 pb-4 pl-8 max-lg:px-6 max-lg:pr-4 max-lg:pl-8">
        {flatItems.length > 0 ? (
          <div className="relative">
            {flatItems.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onScrollTo(i);
                }}
                style={{ paddingLeft: `${item.depth - 1}em` }}
                className={`toc-link ${currentIndex === i ? "active" : ""}`}
              >
                <span className="transition-shadow duration-500">
                  {item.title}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <span className="text-sm opacity-60">这是一篇没有目录的文章。</span>
        )}
      </nav>
    </aside>
  );
}
