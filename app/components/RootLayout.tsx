import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
import Footer from "./common/footer";
import Topbar from "./common/topbar";

const INITIAL_PROGRESS_ID = "initial-progress";

/**
 * Initial Progress Bar - shown in SSG HTML before hydration
 * Uses inline style to ensure animation starts immediately
 */
function InitialProgress() {
  return (
    <div
      id={INITIAL_PROGRESS_ID}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: "0",
        background: "var(--accent)",
        zIndex: 9999,
        animation: "progressLoading 3s ease-out forwards",
      }}
    />
  );
}

/**
 * Navigation Progress Bar (CSS Animation)
 * - Handles initial page load progress (completes InitialProgress on hydration)
 * - loading: 0% -> 80% over 3s with ease-out
 * - complete: 80% -> 100% quickly, then fade out
 * - reset: if location changes during loading, restart from 0%
 */
function NavigationProgress() {
  const navigation = useNavigation();
  const location = useLocation();
  // "idle" | "loading" | "complete"
  const [state, setState] = useState<"idle" | "loading" | "complete">("idle");
  const prevKeyRef = useRef("");

  const currentKey = `${location.pathname}${location.search}`;

  // Handle initial page load progress bar
  useEffect(() => {
    const initialBar = document.getElementById(INITIAL_PROGRESS_ID);
    if (initialBar) {
      // Complete the initial progress bar animation
      initialBar.style.animation = "progressComplete 0.3s ease-out forwards";
      // Remove it after animation completes
      const timer = setTimeout(() => {
        initialBar.remove();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  useEffect(() => {
    const isLoading = navigation.state === "loading";

    if (isLoading) {
      // If location changed during loading, force restart animation
      if (state === "loading" && currentKey !== prevKeyRef.current) {
        // Reset to idle first, then back to loading to restart CSS animation
        setState("idle");
        requestAnimationFrame(() => {
          setState("loading");
        });
      } else if (state !== "loading") {
        setState("loading");
      }
      prevKeyRef.current = currentKey;
    } else if (navigation.state === "idle" && state === "loading") {
      // Navigation complete
      setState("complete");
      const timer = setTimeout(() => {
        setState("idle");
      }, 300); // Wait for complete animation to finish
      return () => clearTimeout(timer);
    }
  }, [navigation.state, currentKey, state]);

  if (state === "idle") return null;

  return (
    <div
      className={`bg-accent fixed top-0 left-0 z-50 h-0.5 ${
        state === "loading"
          ? "animate-progress-loading"
          : "animate-progress-complete"
      }`}
    />
  );
}

/**
 * Root Layout with Outlet
 * Used as a layout route in routes.ts
 */
export default function RootLayout() {
  const location = useLocation();
  const isMemoPage =
    location.pathname === "/memos" || location.pathname.startsWith("/memos");

  return (
    <>
      <InitialProgress />
      <NavigationProgress />
      <Topbar
        hideSearch={isMemoPage}
        placeHolder={!isMemoPage}
        className={isMemoPage ? "border-ui-line-gray-2 border-b" : undefined}
      />
      <Outlet />
      {!isMemoPage && <Footer />}
    </>
  );
}
