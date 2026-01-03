import { debounce, throttle } from 'lib/throttle';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_OFFSET = 93;


export function useTocHighlight(headings: {
  title: string;
  id: string;
  depth: number;
}[], contentRef: React.RefObject<HTMLDivElement | null>) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isViewing, setIsViewing] = useState(false);
  const headingsY = useRef<(number | undefined)[]>([])

  // Update heading positions on mount and content resize(images loaded etc)
  useEffect(() => {
    const handler = () => {
      const y = headings.map(h => {
        const ele = document.getElementById(h.id)
        return ele ? ele.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET : undefined
      })
      headingsY.current = y // should be updated on window resize but I don't want it to be costy
    }
    handler()
    const debounced = debounce(handler, 200)

    const heightObserver = new ResizeObserver(debounced)
    if (contentRef.current) {
      heightObserver.observe(contentRef.current)
    }
    return () => {
      heightObserver.disconnect()
    }
  }, [contentRef])

  // Bind scroll event
  useEffect(() => {
    const handler = throttle(() => {
      if (!headingsY.current || headingsY.current.length === 0) {
        return;
      }
      const scrollY = globalThis.scrollY
      if (scrollY > 300) {
        setIsViewing(true)
      } else (
        setIsViewing(false)
      )
      const scrollAnchor = scrollY + 20
      for (let i = 0; i < headingsY.current.length; i++) {
        if (i === 0 && scrollAnchor < headingsY.current[i]!) { // before first
          setCurrentIndex(-1)
          break
        }
        if (headingsY.current[i] && i + 1 < headingsY.current.length && headingsY.current[i + 1]) { // normal
          if (scrollAnchor >= headingsY.current[i]! && scrollAnchor < headingsY.current[i + 1]!) {
            setCurrentIndex(i)
            break
          }
        } else if (headingsY.current[i] && i + 1 === headingsY.current.length) { // last
          if (scrollAnchor >= headingsY.current[i]!) {
            setCurrentIndex(i)
            break
          }
        }
      }
    }, 50)
    window.addEventListener('scroll', handler)
    return () => {
      window.removeEventListener('scroll', handler)
    }
  }, [])

  const scrollTo = useCallback((index: number) => {
    if (headingsY.current[index]) {
      window.scrollTo({
        top: headingsY.current[index],
        behavior: 'smooth',
      });
    }
  }, [headingsY]);

  return {
    currentIndex,
    isViewing,
    scrollTo,
  };
}