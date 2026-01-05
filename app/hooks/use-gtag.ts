import { useEffect } from "react";
import { useLocation } from "react-router";
import { siteInfo } from "site.config";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/** Upload analystics to google when location changed */
export function useGtag() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("config", siteInfo.GAId, {
        page_path: location.pathname,
      });
    }
  }, [location, siteInfo.GAId]);
  return;
}