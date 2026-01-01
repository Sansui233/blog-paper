import { X } from 'lucide-react';

type TocItem = {
  title: string;
  url: string;
  items: TocItem[];
};

type FlatItem = {
  title: string;
  id: string;
  depth: number;
};

type Props = {
  flatItems: FlatItem[];
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
      className={`
        fixed z-20
        max-w-72 overflow-auto
        animate-[fadeInRight_0.3s_ease]
        transition-[top] duration-300

        /* Desktop positioning */
        left-[78%] w-72
        ${isFixedTop ? 'top-16' : 'top-32'}
        ${isFixedTop ? 'max-h-[calc(100vh-4rem)]' : 'max-h-[calc(100vh-8rem)]'}

        /* Tablet: narrower */
        max-xl:left-[76%] max-xl:w-60

        /* Mobile: drawer from bottom/right */
        max-lg:top-auto max-lg:left-auto max-lg:bottom-34 max-lg:right-2
        max-lg:w-75 max-lg:max-h-[calc(100vh-8rem-9rem)]
        max-lg:bg-bg max-lg:rounded-xl max-lg:shadow-lg max-lg:border max-lg:border-ui-line-gray3
        max-lg:transition-all max-lg:duration-300
        ${isMobileOpen
          ? 'max-lg:opacity-100 max-lg:translate-x-0'
          : 'max-lg:opacity-0 max-lg:translate-x-full max-lg:pointer-events-none'
        }

        /* Small mobile: full width drawer from bottom */
        max-sm:right-[2%] max-sm:bottom-0 max-sm:w-[96%] max-sm:max-w-none max-sm:max-h-[60vh]
        ${isMobileOpen
          ? 'max-sm:translate-y-0 max-sm:translate-x-0'
          : 'max-sm:translate-y-full max-sm:translate-x-0'
        }
      `}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg px-4 pt-4 pb-2 font-bold text-xl max-lg:px-6">
        目录
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`
            float-right cursor-pointer text-text-gray hover:text-accent
            hidden max-lg:block
            ${!isMobileOpen && 'invisible'}
          `}
        >
          <X size="1.5em" />
        </button>
      </div>

      {/* Content */}
      <nav className="px-4 pb-4 max-lg:px-6 max-lg:pb-4">
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
                style={{ paddingLeft: `${(item.depth - 1)}em` }}
                className={`
                  block relative text-sm leading-8 text-text-secondary
                  transition-all duration-300
                  max-lg:text-base

                  before:content-[''] before:absolute before:w-[3px] before:h-4
                  before:top-2 before:-left-3 before:bg-text-primary
                  before:opacity-0 before:transition-opacity before:duration-300

                  hover:[&>span]:shadow-[inset_0_-0.5em_0_var(--accent-hover)]

                  ${currentIndex === i
                    ? 'font-bold text-text-primary before:opacity-100 [&>span]:shadow-[inset_0_-0.5em_0_var(--accent-hover)]'
                    : ''
                  }
                `}
              >
                <span className="transition-shadow duration-500">{item.title}</span>
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
