import { throttle } from "lib/throttle";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Source data type and element prop type
type Props<T extends { id: string | number }> =
  React.HTMLProps<HTMLDivElement> & {
    initialItems: readonly T[];
    Elem: (
      props: {
        source: T;
        triggerHeightChange: Dispatch<SetStateAction<boolean>>;
      } & React.HTMLProps<HTMLDivElement>,
    ) => React.ReactNode;
    Loading?: () => React.ReactNode;
    loadMore?: (
      /** prev 起始位置是当前列表已经有的第一个数据, next 起始位置是当前列表已经有的最后一个数据+1*/
      start_i: number,
      mode: "next" | "prev",
    ) => Promise<T[] | undefined>;
    scrollRef?: React.RefObject<HTMLElement | null>;
    /** 外部的 hook，通知外部 source 变化*/
    notifyItemsChange?: (sources: T[]) => void;
  };

export type VirtualListType = <T extends { id: string | number }>(
  props: Props<T>,
) => React.ReactNode;

const VirtualList: VirtualListType = ({
  initialItems,
  notifyItemsChange,
  Elem,
  scrollRef,
  loadMore,
  Loading,
  id,
  ...otherprops
}) => {
  /** PlaceHolder heights for all items */
  const [itemHeights, setItemHeights] = useState<number[]>(
    new Array(initialItems.length).fill(300),
  );
  /** items to be rendered */
  const [visibleItems, setVisibleItems] = useState(initialItems);
  /** The indices of current items in all iitems. can be negative
   * Don't exceed maxLoadedCount
   */
  const [visibleItemIndices, setVisibleItemIndices] = useState<number[]>(
    new Array(initialItems.length).fill(0).map((_, i) => i),
  );
  const [maxLoadedCount] = useState(initialItems.length * 3);
  const [batchsize] = useState(initialItems.length);
  const [isLoading, setIsLoading] = useState(false);
  /** Prevent multiple fetch at the same time */
  const isFetching = useRef(false);

  /** minHeight for container based on placeHolders*/
  const minHeight = useMemo(
    () => itemHeights.reduce((sum, height) => (sum += height), 0),
    [itemHeights],
  );

  const transformOnIndex = useCallback(
    (i: number) => {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += itemHeights[j];
      }
      return sum;
    },
    [itemHeights],
  );

  const updateItemHeight = useCallback((i_value: number, height: number) => {
    setItemHeights((prev) => {
      const newHeights = [...prev];
      newHeights[i_value] = height;
      return newHeights;
    });
  }, []);

  // Scroll monitor: when < 10% or > 90%, fetch new source
  useEffect(() => {
    if (!loadMore) return;

    const scrollElem = scrollRef?.current;

    const handler = async () => {
      if (isFetching.current) return;

      try {
        const scrollHeight =
          transformOnIndex(visibleItemIndices.at(-1) ?? 0) +
          itemHeights[visibleItemIndices.at(-1) ?? 0] -
          transformOnIndex(visibleItemIndices[0]);
        const currScrollTop =
          (scrollElem ? scrollElem.scrollTop : globalThis.scrollY) -
          transformOnIndex(visibleItemIndices[0]);
        const currScrollBottom =
          currScrollTop +
          globalThis.innerHeight -
          (scrollElem
            ? scrollElem.getBoundingClientRect().y > 0
              ? scrollElem.getBoundingClientRect().y
              : 0
            : 0);
        // console.debug(
        //   `Scroll Height: ${scrollHeight}\n Current Top: ${currScrollTop}\n Current Bottom: ${currScrollBottom}`,
        // );

        const progress = currScrollTop / scrollHeight;
        const progressBottom = currScrollBottom / scrollHeight;

        if (
          isNaN(progress) ||
          !isFinite(progress) ||
          progress > 1.5 ||
          scrollHeight < 0
        )
          return;

        if (progress < 0.15) {
          isFetching.current = true;
          setIsLoading(true);
          const prevdata = await loadMore(visibleItemIndices[0], "prev");
          setIsLoading(false);
          if (!prevdata || prevdata.length === 0) return;

          // prev data max length is maxLoadedCount - batchsize, trim head
          if (prevdata.length > maxLoadedCount - batchsize) {
            prevdata.splice(0, prevdata.length - (maxLoadedCount - batchsize));
          }

          let prevItemIndices = prevdata.map(
            (_, i) => i - prevdata.length + visibleItemIndices[0],
          );
          // concat prevItem and currentItem, and trim both to maxLoadedCount
          let fullIndex = prevItemIndices.concat(visibleItemIndices);
          let fulldata = prevdata.concat(visibleItems);
          if (fullIndex.length > maxLoadedCount) {
            fullIndex.splice(maxLoadedCount);
            fulldata.splice(maxLoadedCount);
          }

          setVisibleItemIndices(fullIndex);
          setVisibleItems(fulldata);
          notifyItemsChange?.(fulldata);
        } else if (progressBottom > 0.85) {
          isFetching.current = true;

          setIsLoading(true);
          const reqStart = (visibleItemIndices.at(-1) || 0) + 1;
          const nextdata = await loadMore(reqStart, "next");
          setIsLoading(false);
          if (!nextdata || nextdata.length === 0) return;
          // next data max length is maxLoadedCount - batchsize, trim tail
          if (nextdata.length > maxLoadedCount - batchsize) {
            nextdata.splice(
              maxLoadedCount - batchsize,
              nextdata.length - (maxLoadedCount - batchsize),
            );
          }

          const nextItemIndices = nextdata.map(
            (_, i) => i + (visibleItemIndices.at(-1) || 0) + 1,
          );
          // concat prevItem and currentItem, and trim both to maxLoadedCount
          const fullIndex = visibleItemIndices.concat(nextItemIndices);
          const fulldata = visibleItems.concat(nextdata);

          if (fullIndex.length > maxLoadedCount) {
            fullIndex.splice(0, fullIndex.length - maxLoadedCount);
            fulldata.splice(0, fulldata.length - maxLoadedCount);
          }

          setVisibleItemIndices(fullIndex);
          setVisibleItems(fulldata);
          notifyItemsChange?.(fulldata);
        }
      } catch (error) {
        console.error("VirtualList scroll fetch error:", error);
      } finally {
        isFetching.current = false;
      }
    };

    const throttled = throttle(handler, 500);

    if (scrollElem) {
      scrollElem.addEventListener("scroll", throttled);
    } else {
      globalThis.addEventListener("scroll", throttled);
    }

    return () => {
      if (scrollElem) {
        scrollElem.removeEventListener("scroll", throttled);
      } else {
        globalThis.removeEventListener("scroll", throttled);
      }
    };
  }, [
    scrollRef,
    visibleItems,
    visibleItemIndices,
    loadMore,
    setVisibleItems,
    transformOnIndex, // rely on itemHeights
  ]);

  return (
    <div
      style={Object.assign(
        {
          position: "relative" as const,
          width: "100%",
          minHeight: `${minHeight}px`,
          willChange: "transform",
        },
        otherprops.style,
      )}
      id={id}
      {...otherprops}
    >
      {visibleItems.map((e, i) => (
        <ListItem
          key={e.id}
          i_value={visibleItemIndices[i]}
          Elem={Elem}
          source={e}
          itemHeights={itemHeights}
          updateItemHeight={updateItemHeight}
        />
      ))}
      {Loading && isLoading ? (
        <div
          style={{
            position: "absolute",
            width: "100%",
            transform: `translateY(${itemHeights.reduce((sum, height) => (sum += height), 0)}px)`,
          }}
        >
          <Loading />
        </div>
      ) : null}
    </div>
  );
};

function ListItem<T extends { id: string | number }>({
  Elem,
  i_value,
  source,
  itemHeights,
  updateItemHeight,
}: {
  Elem: Props<T>["Elem"];
  source: T;
  i_value: number;
  itemHeights: readonly number[];
  updateItemHeight: (i: number, height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handler = useCallback(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      if (itemHeights[i_value] === height) return;
      requestAnimationFrame(() => {
        updateItemHeight(i_value, height);
      });
    }
  }, [ref, updateItemHeight, i_value]);

  // On window resize
  useEffect(() => {
    const throttled = throttle(handler, 150);
    globalThis.addEventListener("resize", throttled);
    return () => {
      globalThis.removeEventListener("resize", throttled);
    };
  }, [ref, i_value, updateItemHeight, handler]);

  // Height change trigger from child
  const [isHeightChange, triggerHeightChange] = useState(false);
  useEffect(() => {
    if (isHeightChange) {
      handler();
      triggerHeightChange(false);
    }
  }, [isHeightChange, handler]);

  // Visible after height is set
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    handler();
    setIsVisible(true);
  }, [ref, handler]);

  // Calculate translateY
  const translateY = useMemo(() => {
    return itemHeights
      .slice(0, i_value)
      .reduce((sum, height) => (sum += height), 0);
  }, [i_value, itemHeights]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        width: "100%",
        transform: `translateY(${translateY}px)`,
        visibility: isVisible ? "visible" : "hidden",
      }}
    >
      {Elem({
        source,
        triggerHeightChange,
      })}
    </div>
  );
}

export default VirtualList;
