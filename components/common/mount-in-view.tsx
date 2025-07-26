import { ReactNode, useEffect, useRef, useState } from 'react';

// Simply make the element mounted when scroll into view;

type Props = {
  placeHolderHeight?: string // Default 50vh
  threshold?: number
  children?: ReactNode
}

const DivInViewPort = ({ placeHolderHeight, threshold = 1, children }: Props) => {
  const target = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Create Observer
    const callback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.boundingClientRect.height !== 0 && entry.intersectionRatio >= threshold) {
          setIsMounted(true)
        }
      })
    }

    const curr = target.current
    const observer = new IntersectionObserver(callback, {
      threshold: threshold ? threshold : 0.5
    });
    if (curr) {
      observer.observe(curr)
    } else {
      console.error('observer error on mount: Current target is not mounted')
    }

    return () => {
      if (curr) {
        observer.unobserve(curr)
      } else {
        console.error('observer error on unmount: Current target has been removed')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div ref={target} style={{ minHeight: isMounted ? 'unset' : placeHolderHeight ? placeHolderHeight : "50vh" }}>
      {isMounted && children}
    </div>
  )
}

export default DivInViewPort