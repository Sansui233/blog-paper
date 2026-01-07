import { throttle } from "lib/throttle";
import { ChevronDown, Search } from "lucide-react";
import React, {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigation } from "react-router";
import { siteInfo } from "site.config";
import NekoIcon from "~/assets/icons/neko.svg?react";
import MenuIcon from "./menuicon";
import Sidebar from "./sidebar";

// Dynamic import for code splitting - preloaded after first render
const searchBoxImport = () => import("../searchbox");
const LazySearchBox = lazy(searchBoxImport);

type Props = React.HTMLProps<HTMLElement> & {
  placeHolder?: boolean;
  scrollElem?: HTMLElement;
  hideSearch?: boolean;
};

export default function Topbar({
  placeHolder = true,
  scrollElem,
  hideSearch,
  className,
  ...otherProps
}: Props) {
  const [isHidden, setIsHidden] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isDropperOpen, setIsDropperOpen] = useState(false);
  const location = useLocation();
  const searchIcon = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Preload SearchBox after first render
  useEffect(() => {
    searchBoxImport();
  }, []);

  // Hide on scroll
  useEffect(() => {
    const elem = scrollElem ? scrollElem : globalThis;

    const getScrollPos = () => {
      if (scrollElem && scrollElem instanceof HTMLElement) {
        return scrollElem.scrollTop;
      }
      return globalThis.scrollY;
    };

    let previousTop = getScrollPos();

    const onScroll = throttle(() => {
      if (getScrollPos() < 200) {
        setIsHidden(false);
        previousTop = getScrollPos();
        return;
      }

      const distance = getScrollPos() - previousTop;

      if (distance > 10) {
        setIsHidden(true);
        previousTop = getScrollPos();
      } else if (distance < -10) {
        setIsHidden(false);
        previousTop = getScrollPos();
      }
    }, 100);

    elem.addEventListener("scroll", onScroll);

    return () => {
      elem.removeEventListener("scroll", onScroll);
    };
  }, [scrollElem]);

  const toggleSidebar = () => {
    setIsSidebar(!isSidebar);
  };

  const clickSearch = () => {
    setIsSearch(!isSearch);
  };

  const updateSearch = (innerState: boolean) => {
    setIsSearch(innerState);
  };

  // Determine current page for nav highlighting
  const pathname = location.pathname;
  const isPostsPage = pathname === "/" || pathname.startsWith("/posts");
  const isMemosPage = pathname === "/memos" || pathname.startsWith("/memos");
  const isAboutPage = pathname === "/about" || pathname.startsWith("/about");

  const getCurrentPageName = () => {
    if (isPostsPage) return t("ui.posts");
    if (isMemosPage) return t("ui.memos");
    if (isAboutPage) return t("ui.about");
    return "";
  };

  return (
    <>
      {/* SearchBox with dynamic import - always rendered for exit animation */}
      <Suspense fallback={null}>
        <LazySearchBox
          outSetSearch={updateSearch}
          outIsShow={isSearch}
          iconEle={searchIcon}
        />
      </Suspense>

      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />

      <header
        className={
          `bg-bg/60 fixed z-10 box-content flex h-15.75 w-full items-center justify-between backdrop-blur-[6px] transition-transform duration-500 ease-out ${isHidden ? "-translate-y-full" : "translate-y-0"} ` +
          (className ? ` ${className}` : "")
        }
        {...otherProps}
      >
        {/* Avatar / Logo */}
        <div className="w-52.5 flex-auto items-center justify-start font-semibold max-md:w-25">
          <Link to="/" className="flex items-center px-4">
            <NekoIcon width={36} className="shrink-0" />
            <span className="px-2 max-md:hidden">
              {t("ui.blogTitle", { author: siteInfo.author })}
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <DesktopNav />

        {/* Right side: Mobile nav dropdown + Search + Menu */}
        <div className="flex w-52.5 flex-auto items-center justify-end max-md:w-25 [&>div]:mr-4">
          {/* Mobile Nav Dropdown */}
          <div className="relative min-w-14.25 text-xl font-semibold min-[580px]:hidden">
            {/* Dropdown menu */}
            <div
              className={`absolute -top-2 left-0 w-full pt-10 transition-all duration-300 ${
                isDropperOpen
                  ? "border-ui-line-gray-3 bg-bg visible rounded-lg border shadow-md"
                  : "invisible border-transparent"
              } `}
            >
              {!isPostsPage && (
                <DropdownLink
                  to="/"
                  isOpen={isDropperOpen}
                  setIsOpen={setIsDropperOpen}
                >
                  {t("ui.posts")}
                </DropdownLink>
              )}
              {!isMemosPage && (
                <DropdownLink
                  to="/memos"
                  isOpen={isDropperOpen}
                  setIsOpen={setIsDropperOpen}
                >
                  {t("ui.memos")}
                </DropdownLink>
              )}
              {!isAboutPage && (
                <DropdownLink
                  to="/about"
                  isOpen={isDropperOpen}
                  setIsOpen={setIsDropperOpen}
                >
                  {t("ui.about")}
                </DropdownLink>
              )}
            </div>

            {/* Current page button */}
            <button
              className="text-text-primary relative flex items-center px-3"
              onClick={() => setIsDropperOpen((v) => !v)}
            >
              {getCurrentPageName()}
              <ChevronDown size="1.25em" className="-mr-2" />
            </button>
          </div>

          {/* Search Icon */}
          <div
            ref={searchIcon}
            onClick={() => (!hideSearch ? clickSearch() : null)}
            className={`cursor-pointer transition-colors duration-300 ${hideSearch ? "hidden" : ""} ${isSearch ? "text-accent" : ""} hover:text-accent-hover`}
          >
            <Search />
          </div>

          {/* Menu Icon */}
          <div onClick={toggleSidebar} className="mr-5 w-5.5">
            <MenuIcon width="100%" height="1.15rem" isClose={isSidebar} />
          </div>
        </div>
      </header>

      {/* Placeholder */}
      {placeHolder && (
        <div className="text-accent h-15.75 w-full pt-2.5 text-center font-serif text-[10px] italic opacity-60">
          人活着就是为了卡卡西
        </div>
      )}
    </>
  );
}

// --- Sub-components ---

const NAV_ITEMS = [
  { href: "/", pathMatch: (p: string) => p === "/" || p.startsWith("/posts") },
  {
    href: "/memos",
    pathMatch: (p: string) => p === "/memos" || p.startsWith("/memos"),
  },
  {
    href: "/about",
    pathMatch: (p: string) => p === "/about" || p.startsWith("/about"),
  },
] as const;

function DesktopNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigation = useNavigation();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Track indicator position and state
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0, // Hidden until first measurement
  });
  const [circleStyle, setCircleStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const prevIndexRef = useRef<number>(-1);

  // Get active index based on current path
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.pathMatch(location.pathname),
  );

  // Get target index during navigation
  const getTargetIndex = () => {
    if (navigation.state === "loading" && navigation.location) {
      const targetPath = navigation.location.pathname;
      return NAV_ITEMS.findIndex((item) => item.pathMatch(targetPath));
    }
    return -1;
  };

  const targetIndex = getTargetIndex();
  const isNavigating = navigation.state === "loading" && targetIndex >= 0;

  // Determine which index to show indicator at
  const displayIndex =
    hoverIndex !== null ? hoverIndex : isNavigating ? targetIndex : activeIndex;

  // Update indicator position - measure the Link element (text) not the container
  const updateIndicatorPosition = (index: number, animate = true) => {
    const item = itemRefs.current[index];
    const nav = navRef.current;
    if (!item || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const left = itemRect.left - navRect.left;
    const width = itemRect.width;

    // Determine movement direction
    const direction =
      prevIndexRef.current >= 0 && prevIndexRef.current < index
        ? "right"
        : prevIndexRef.current >= 0 && prevIndexRef.current > index
          ? "left"
          : null;

    // Show circle during movement
    if (animate && direction) {
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 500);
    }

    // Circle position: at the leading edge based on direction
    const circleSize = 6; // approximate px for 0.4em
    const circleLeft =
      direction === "right"
        ? left + width - circleSize
        : direction === "left"
          ? left
          : left + width / 2 - circleSize / 2; // center when no direction

    setCircleStyle({
      left: circleLeft,
      opacity: 1,
      // Circle moves ahead with ease-out
      transition: animate ? "left 0.5s cubic-bezier(0.7, 0, 0.2, 1)" : "none",
    });

    setIndicatorStyle({
      left,
      width,
      opacity: 1,
      // Bar follows with very slow start then catches up quickly
      transition: animate
        ? "left 0.7s cubic-bezier(0.7, 0, 0.2, 1), width 0.3s ease-out"
        : "none",
    });

    prevIndexRef.current = index;
  };

  // Mark as mounted and do initial measurement
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Update position when displayIndex changes
  useLayoutEffect(() => {
    if (displayIndex >= 0 && hasMounted) {
      updateIndicatorPosition(displayIndex, hasMounted);
    }
  }, [displayIndex, hasMounted]);

  // Handle hover
  const handleMouseEnter = (index: number) => {
    if (index !== hoverIndex) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      if (displayIndex >= 0) {
        updateIndicatorPosition(displayIndex, false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayIndex]);

  const labels = [t("ui.posts"), t("ui.memos"), t("ui.about")];

  return (
    <nav
      ref={navRef}
      className="relative flex max-w-[50%] flex-[2_1_auto] items-center justify-evenly tracking-wide max-[580px]:hidden min-[580px]:max-w-97.5"
      onMouseLeave={handleMouseLeave}
    >
      {/* Leading circle - always rendered, visible during movement */}
      {displayIndex >= 0 && (
        <div
          className="bg-accent-hover pointer-events-none absolute top-[1.1em] -z-10 h-[0.4em] w-[0.4em] rounded-full"
          style={{
            ...circleStyle,
          }}
        />
      )}

      {/* Sliding indicator bar - follows the circle */}
      {displayIndex >= 0 && (
        <div
          className={`bg-accent-hover pointer-events-none absolute top-[1.1em] -z-10 h-[0.4em] rounded-[0.5em] ${
            isNavigating ? "animate-nav-indicator-blink" : ""
          }`}
          style={indicatorStyle}
        />
      )}

      {/* Nav items */}
      {NAV_ITEMS.map((item, index) => (
        <div
          key={item.href}
          className="px-2 pt-0.5 font-semibold"
          onMouseEnter={() => handleMouseEnter(index)}
        >
          <Link
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            to={item.href}
            className={`hover:text-accent relative transition-colors duration-300 ${
              displayIndex === index ? "text-text-primary" : ""
            }`}
          >
            {labels[index]}
          </Link>
        </div>
      ))}
    </nav>
  );
}

type DropdownLinkProps = {
  to: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isFirst?: boolean;
  children: React.ReactNode;
};

function DropdownLink({
  to,
  isOpen,
  setIsOpen,
  isFirst,
  children,
}: DropdownLinkProps) {
  return (
    <Link
      to={to}
      className={`text-text-secondary my-2 block px-1 pb-1 pl-2.75 transition-all duration-500 ${isOpen ? "blur-0 opacity-100" : "pointer-events-none opacity-0 blur-md"} `}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );
}
