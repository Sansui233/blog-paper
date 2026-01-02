import { ChevronDown, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { siteInfo } from "site.config";
import MenuIcon from "./menuicon";
import NekoIcon from "./nekoicon";
import Sidebar from "./sidebar";

type Props = React.HTMLProps<HTMLElement> & {
  placeHolder?: boolean;
  scrollElem?: HTMLElement;
  hideSearch?: boolean;
};

// Throttle helper
function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let lastTime = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

export default function Topbar({
  placeHolder = true,
  scrollElem,
  hideSearch,
  ...otherProps
}: Props) {
  const [isHidden, setIsHidden] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isDropperOpen, setIsDropperOpen] = useState(false);
  const location = useLocation();
  const searchIcon = useRef<HTMLDivElement>(null);

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

  // Determine current page for nav highlighting
  const pathname = location.pathname;
  const isPostsPage = pathname === "/" || pathname.startsWith("/posts");
  const isMemosPage = pathname === "/memos" || pathname.startsWith("/memos");
  const isAboutPage = pathname === "/about" || pathname.startsWith("/about");

  const getCurrentPageName = () => {
    if (isPostsPage) return "Posts";
    if (isMemosPage) return "Memos";
    if (isAboutPage) return "About";
    return "";
  };

  return (
    <>
      {/* TODO: SearchBox component */}
      {/* <SearchBox outSetSearch={setIsSearch} outIsShow={isSearch} iconEle={searchIcon} /> */}

      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />

      <header
        className={`
          h-15.75 w-full box-content
          flex justify-between items-center
          fixed z-10
          bg-bg/60 backdrop-blur-[6px]
          transition-transform duration-500 ease-out
          ${isHidden ? "-translate-y-full" : "translate-y-0"}
        `}
        {...otherProps}
      >
        {/* Avatar / Logo */}
        <div className="flex-auto justify-start items-center font-semibold w-52.5 max-md:w-25">
          <Link to="/" className="px-4 flex items-center">
            <NekoIcon width={36} className="shrink-0" />
            <span className="px-2 max-md:hidden">{`${siteInfo.author}'s blog`}</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav
          className="
            flex-[2_1_auto] flex justify-evenly items-center
            tracking-wide
            max-w-[50%] min-[580px]:max-w-97.5
            max-[580px]:hidden
          "
        >
          <NavItem href="/" isActive={isPostsPage}>
            Posts
          </NavItem>
          <NavItem href="/memos" isActive={isMemosPage}>
            Memos
          </NavItem>
          <NavItem href="/about" isActive={isAboutPage}>
            About
          </NavItem>
        </nav>

        {/* Right side: Mobile nav dropdown + Search + Menu */}
        <div className="flex-auto flex items-center justify-end w-52.5 max-md:w-25 [&>div]:mr-4">
          {/* Mobile Nav Dropdown */}
          <div className="relative min-w-14.25 text-xl font-semibold min-[580px]:hidden">
            {/* Dropdown menu */}
            <div
              className={`
                absolute -top-2 left-0 w-full
                transition-all duration-300
                ${isDropperOpen
                  ? "visible rounded-lg border border-ui-line-gray-3 bg-bg shadow-md"
                  : "invisible border-transparent"
                }
              `}
            >
              {!isPostsPage && (
                <DropdownLink to="/" isOpen={isDropperOpen} isFirst>
                  Posts
                </DropdownLink>
              )}
              {!isMemosPage && (
                <DropdownLink to="/memos" isOpen={isDropperOpen}>
                  Memos
                </DropdownLink>
              )}
              {!isAboutPage && (
                <DropdownLink to="/about" isOpen={isDropperOpen}>
                  About
                </DropdownLink>
              )}
            </div>

            {/* Current page button */}
            <button
              className="relative text-text-primary px-3 flex items-center"
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
            className={`
              cursor-pointer transition-colors duration-300
              ${hideSearch ? "hidden" : ""}
              ${isSearch ? "text-accent" : ""}
              hover:text-accent-hover
            `}
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
        <div className="h-15.75 w-full text-center pt-2.5 text-[10px] italic text-accent font-serif opacity-60">
          人活着就是为了卡卡西
        </div>
      )}
    </>
  );
}

// --- Sub-components ---

type NavItemProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
};

function NavItem({ href, isActive, children }: NavItemProps) {
  return (
    <div className="px-2 pt-0.5 font-semibold">
      <Link
        to={href}
        className={`
          relative transition-colors duration-300
          hover:text-accent
          ${isActive
            ? "before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-[0.4em] before:rounded-[0.5em] before:bg-accent-hover before:-z-10"
            : ""
          }
        `}
      >
        {children}
      </Link>
    </div>
  );
}

type DropdownLinkProps = {
  to: string;
  isOpen: boolean;
  isFirst?: boolean;
  children: React.ReactNode;
};

function DropdownLink({ to, isOpen, isFirst, children }: DropdownLinkProps) {
  return (
    <Link
      to={to}
      className={`
        block text-center text-text-secondary
        my-2 px-1 pb-1
        transition-all duration-500
        ${isOpen ? "opacity-100 blur-0" : "opacity-0 blur-md pointer-events-none"}
        ${isFirst ? "mt-11 pt-2 border-t border-ui-line-gray-3" : ""}
      `}
    >
      {children}
    </Link>
  );
}
