import { throttle } from "lib/throttle";
import { useEffect, useRef, useState } from "react";

type Props = {
  items: [string, number][];
  current: number;
  setCurrent: (num: number) => void;
};

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
      className="bg-bg sticky -top-px z-1 mt-4 flex overflow-x-auto py-4 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item, i) => {
        const isCurrent = current === i;
        return (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`mr-4 cursor-pointer rounded-md border px-2.5 py-1.5 text-sm whitespace-nowrap transition-all duration-500 ${
              isCurrent
                ? "border-bg-inverse bg-bg-inverse text-bg"
                : "border-ui-line-gray-2 text-text-gray hover:bg-hover-bg"
            } `}
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
