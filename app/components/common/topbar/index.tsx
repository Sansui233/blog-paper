import { throttle } from "lib/throttle";
import { ChevronDown, Search } from "lucide-react";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
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
        <nav className="flex max-w-[50%] flex-[2_1_auto] items-center justify-evenly tracking-wide max-[580px]:hidden min-[580px]:max-w-97.5">
          <NavItem href="/" isActive={isPostsPage}>
            {t("ui.posts")}
          </NavItem>
          <NavItem href="/memos" isActive={isMemosPage}>
            {t("ui.memos")}
          </NavItem>
          <NavItem href="/about" isActive={isAboutPage}>
            {t("ui.about")}
          </NavItem>
        </nav>

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
                <DropdownLink to="/" isOpen={isDropperOpen} isFirst>
                  {t("ui.posts")}
                </DropdownLink>
              )}
              {!isMemosPage && (
                <DropdownLink to="/memos" isOpen={isDropperOpen}>
                  {t("ui.memos")}
                </DropdownLink>
              )}
              {!isAboutPage && (
                <DropdownLink to="/about" isOpen={isDropperOpen}>
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
        className={`hover:text-accent relative transition-colors duration-300 ${
          isActive
            ? "before:bg-accent-hover before:absolute before:inset-x-0 before:bottom-0 before:-z-10 before:h-[0.4em] before:rounded-[0.5em] before:content-['']"
            : ""
        } `}
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
      className={`text-text-secondary my-2 block px-1 pb-1 pl-2.75 transition-all duration-500 ${isOpen ? "blur-0 opacity-100" : "pointer-events-none opacity-0 blur-md"} `}
    >
      {children}
    </Link>
  );
}
