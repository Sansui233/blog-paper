import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TocItem = {
  title: string;
  url: string;
  items: TocItem[];
};

const SCROLL_OFFSET = 93;

// Flatten nested TOC items for easier tracking
function flattenToc(items: TocItem[], depth = 1): Array<{ title: string; id: string; depth: number }> {
  const result: Array<{ title: string; id: string; depth: number }> = [];
  for (const item of items) {
    result.push({
      title: item.title,
      id: item.url.replace('#', ''),
      depth,
    });
    if (item.items?.length) {
      result.push(...flattenToc(item.items, depth + 1));
    }
  }
  return result;
}

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

export function useTocHighlight(toc: TocItem[], contentRef: React.RefObject<HTMLDivElement | null>) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isViewing, setIsViewing] = useState(false);
  const headingsYRef = useRef<(number | undefined)[]>([]);

  const flatItems = useMemo(() => flattenToc(toc), [toc]);

  // Calculate heading positions
  const updateHeadingPositions = useCallback(() => {
    const positions = flatItems.map(item => {
      const el = document.getElementById(item.id);
      return el ? el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET : undefined;
    });
    headingsYRef.current = positions;
  }, [flatItems]);

  // Update positions on mount and content resize
  useEffect(() => {
    updateHeadingPositions();

    const resizeObserver = new ResizeObserver(() => updateHeadingPositions());
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateHeadingPositions, contentRef]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      setIsViewing(scrollY > 300);

      const headingsY = headingsYRef.current;
      const scrollAnchor = scrollY + 20;

      for (let i = 0; i < headingsY.length; i++) {
        const currentY = headingsY[i];
        const nextY = headingsY[i + 1];

        if (i === 0 && currentY !== undefined && scrollAnchor < currentY) {
          setCurrentIndex(-1);
          return;
        }

        if (currentY !== undefined) {
          if (nextY !== undefined && scrollAnchor >= currentY && scrollAnchor < nextY) {
            setCurrentIndex(i);
            return;
          }
          if (i === headingsY.length - 1 && scrollAnchor >= currentY) {
            setCurrentIndex(i);
            return;
          }
        }
      }
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((index: number) => {
    const y = headingsYRef.current[index];
    if (y !== undefined) {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return {
    flatItems,
    currentIndex,
    isViewing,
    scrollTo,
  };
}