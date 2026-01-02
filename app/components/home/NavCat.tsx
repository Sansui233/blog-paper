import { useEffect, useRef, useState } from "react";

type Props = {
  items: [string, number][];
  current: number;
  setCurrent: (num: number) => void;
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

export default function NavCat({ items, current, setCurrent }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [isMouseInside, setIsMouseInside] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsMouseInside(true);
    const handleMouseLeave = () => setIsMouseInside(false);

    if (ref.current) {
      ref.current.addEventListener("mouseenter", handleMouseEnter);
      ref.current.addEventListener("mouseleave", handleMouseLeave);
    }

    const handleWheel = function (e: WheelEvent) {
      if (ref.current && isMouseInside) {
        e.preventDefault();
        ref.current.scrollLeft += e.deltaY;
      }
    };
    const throttledWheel = throttle(handleWheel, 20);

    window.addEventListener("wheel", throttledWheel, { passive: false });

    const r = ref.current;

    return () => {
      window.removeEventListener("wheel", throttledWheel);
      if (r) {
        r.removeEventListener("mouseenter", handleMouseEnter);
        r.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  });

  return (
    <nav
      ref={ref}
      className="
        flex mt-4 py-4 overflow-x-auto
        sticky -top-px bg-bg z-[1]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {items.map((item, i) => {
        const isCurrent = current === i;
        return (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`
              text-sm py-1.5 px-2.5 mr-4
              cursor-pointer rounded-md
              border whitespace-nowrap
              transition-all duration-500
              ${isCurrent
                ? "border-bg-inverse bg-bg-inverse text-bg"
                : "border-ui-line-gray-2 text-text-gray hover:bg-hover-bg"
              }
            `}
          >
            <span>
              {item[0]} {item[1]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
