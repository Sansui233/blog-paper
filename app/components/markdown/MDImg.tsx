import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DetailedHTMLProps,
  type ImgHTMLAttributes,
  type Ref,
} from "react";
import { useDocumentEvent } from "~/hooks/use-event";
import { useViewHeight, useViewWidth } from "~/hooks/use-view";
import { SkeletonError, SkeletonLoading } from "../common/skeleton";

/**
 * custom img component
 * @param props
 * @returns
 */

export function MDImg(
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
) {
  // see https://nextjs.org/docs/messages/react-hydration-error#possible-ways-to-fix-it
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isModal, setisModal] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [isError, setisError] = useState(false);
  const imgRef: Ref<HTMLImageElement> | undefined = useRef(null);
  const containerRef: Ref<HTMLDivElement> | undefined = useRef(null);

  // life cycle - init style
  const [containerStyle, setContainerStyle] = useState<
    CSSProperties & {
      width: string;
      height: string;
    }
  >({ width: "100%", height: "auto" });
  const [imgStyle, setImgStyle] = useState<CSSProperties>({
    filter: "blur(12px)",
    height: "0",
    margin: "0",
  });

  const vw = useViewWidth();
  const vh = useViewHeight();

  // After image loaded
  useEffect(() => {
    if (!isClient || !imgRef.current) return;

    const handleImageLoaded = () => {
      setisLoading(false);
      setImgStyle({
        cursor: "zoom-in",
        filter: "blur(0px)",
        transform: "scale(1) translate(0,0)",
        height: "auto",
      });
    };

    const elem = imgRef.current;

    if (elem.complete) {
      handleImageLoaded();
    } else {
      elem.onload = handleImageLoaded;
      elem.onerror = () => {
        setisLoading(false);
        setisError(true);
        setImgStyle({
          display: "none",
        });
      };
    }
    return () => {
      elem.onload = null;
      elem.onerror = null;
    };
  }, [isClient]);

  // Close on scroll
  useDocumentEvent(
    "scroll",
    () => {
      if (isModal) {
        setisModal(false);
        handleClick();
      }
    },
    false,
    [isModal],
  );

  // Click to show or hide image model
  const handleClick = useCallback(() => {
    if (isModal && imgRef.current && containerRef.current) {
      // hide model
      //0ms
      setImgStyle((s) => {
        return {
          ...s,
          transform: "scale(1) translate(0,0)",
          cursor: "zoom-in",
        };
      });
      // 300ms
      setTimeout(() => {
        setImgStyle((s) => {
          return {
            ...s,
            zIndex: "auto",
          };
        });
        setContainerStyle((s) => {
          return {
            ...s,
            height: "auto",
            zIndex: "auto",
          };
        });
      }, 300);
    } else if (imgRef.current && containerRef.current) {
      // show model
      const img = imgRef.current.getBoundingClientRect();
      const ctn = containerRef.current.getBoundingClientRect();
      const width = img.width;
      const height = img.height;
      const transY = -(img.y - vh / 2 + height / 2);
      const transX = img.x - 2 * ctn.x - ctn.width / 2 + vw / 2;

      const scale = Math.min(vw / width, vh / height) - 0.05;
      setContainerStyle((s) => {
        // Lock height
        return {
          ...s,
          height: height + "px",
        };
      });
      setImgStyle((s) => {
        return {
          ...s,
          transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
          zIndex: 11,
          cursor: "zoom-out",
        };
      });
    } else {
      console.error("[Error] img nothing happened, ref not inited");
    }
    setisModal(!isModal);
  }, [isModal, vh, vw]);

  // Render
  if (isClient) {
    return (
      <div
        ref={containerRef}
        className="relative my-6"
        style={{
          ...containerStyle,
        }}
      >
        {isLoading && <SkeletonLoading height="100px" width="100%" />}
        {isError && <SkeletonError height="100px" width="100%" />}
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          ref={imgRef}
          loading="lazy"
          onClick={handleClick}
          style={{
            ...imgStyle,
            position: "relative",
            transition: "transform .3s ease, filter 1s ease",
          }}
          {...props}
        />
        {/* Mask */}
        {isModal ? (
          <div
            className="fixed inset-0 z-20 cursor-zoom-out backdrop-blur"
            onClick={handleClick}
          />
        ) : null}
      </div>
    );
  }

  return;
}
