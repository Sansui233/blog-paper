
import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes, LegacyRef, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDocumentEvent } from "../lib/use-event";
import { useViewHeight, useViewWidth } from "../lib/use-view";
import { LoaderAnimation } from "../styles/animations";

/**
 * custom img component
 * @param props 
 * @returns 
 */
export function MDImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  // see https://nextjs.org/docs/messages/react-hydration-error#possible-ways-to-fix-it
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [isModel, setisModel] = useState(false)
  const [isLoading, setisLoading] = useState(true)
  const imgRef: LegacyRef<HTMLImageElement> | undefined = useRef(null);
  const containerRef: LegacyRef<HTMLDivElement> | undefined = useRef(null);
  const [containerStyle, setContainerStyle] = useState<CSSProperties & {
    width: string,
    height: string
  }>({ width: '100%', height: "auto" });
  const [imgStyle, setImgStyle] = useState<CSSProperties>({
    filter: "blur(12px)",
  });

  const vw = useViewWidth()
  const vh = useViewHeight()

  // After image loaded
  useEffect(() => {
    if (!isClient || !imgRef.current) return
    const handleImageLoaded = () => {
      setisLoading(false)
      setImgStyle({
        cursor: "zoom-in",
        filter: "blur(0px)",
        transform: "scale(1) translate(0,0)",
      })
    };
    const handleImageError = () => {
      setisLoading(false)
    };

    const elem = imgRef.current;
    if (elem.complete) {
      handleImageLoaded();
    } else {
      // Otherwise, wait for the image to load
      elem.onload = handleImageLoaded;
      elem.onerror = handleImageError;
    }
    return () => {
      elem.onload = null;
      elem.onerror = null;
    };
  }, [isClient]);

  // close on scroll
  useDocumentEvent("scroll", () => {
    if (isModel) {
      setisModel(false)
      handleClick()
    }
  }, false, [isModel])

  /**
   * with UX animation
   */
  const handleClick = useCallback(() => {
    if (isModel && imgRef.current && containerRef.current) { // hide
      // hide model
      //0ms
      setImgStyle(s => {
        return {
          ...s,
          transform: "scale(1) translate(0,0)",
          cursor: "zoom-in"
        }
      })
      // 300ms
      setTimeout(() => {
        setImgStyle(s => {
          return {
            ...s,
            zIndex: "auto"
          }
        })
        setContainerStyle(s => {
          return {
            ...s,
            height: "auto",
            zIndex: "auto",
          }
        })
      }, 300)

    } else if (imgRef.current && containerRef.current) { // show
      // show
      const img = imgRef.current.getBoundingClientRect()
      const ctn = containerRef.current.getBoundingClientRect()
      const width = img.width
      const height = img.height
      const transY = -(img.y - vh / 2 + height / 2)
      const transX = img.x - 2 * ctn.x - ctn.width / 2 + vw / 2

      const scale = Math.min(vw / width, vh / height) - 0.05
      setContainerStyle(s => {
        // Lock height
        return {
          ...s,
          height: height + "px",
        }
      })
      setImgStyle(s => {
        return {
          ...s,
          transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
          zIndex: 11,
          cursor: "zoom-out"
        }
      })
    } else {
      console.error("[Error] img nothing happened, ref not inited")
    }
    setisModel(!isModel)
  }, [isModel, vh, vw])

  if (isClient) {
    return <FluidWrap ref={containerRef} style={{
      ...containerStyle
    }}>
      {/* <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} /> */}
      {isLoading && <FluidLoader>
        <span></span>
      </FluidLoader>}
      {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img ref={imgRef} loading="lazy" onClick={handleClick} style={{
        ...imgStyle,
        position: "relative",
        transition: "transform .3s ease, filter .5s ease"
      }} {...props} />

      {/* bg layer */}
      {isModel ? <div onClick={handleClick} style={{
        position: "fixed",
        backdropFilter: "blur(10px)",
        top: 0,
        left: 0,
        WebkitBackdropFilter: "blur(10px)",
        right: 0,
        bottom: 0,
        cursor: "zoom-out",
        zIndex: 10
      }}></div> : null}
    </FluidWrap>
  }
  return
}

const FluidWrap = styled.div`
  position: relative;
  transition: all .3s ease-in-out;
  margin: 1.5rem 0;
`

const FluidLoader = styled.div`
/* HTML: <div class="loader"></div> */
  position: absolute;
  top: 0px;
  width: 100%;
  text-align: center;
  span {
    display:inline-block;
    padding: 10px;
    width: 120px;
    height: 20px;
    background: linear-gradient(#000 0 0) left/20px 20px no-repeat #ddd;
    animation: ${LoaderAnimation} 1s infinite linear;
  }
  pointer-events: none;
`




/**
 * return Tag component with search handler
 */
export function memoTag(searchHandler?: (text: string, immediateSearch?: boolean) => void) {

  function Tag({ text }: { text: string }) {
    // console.debug("[markdown.tsx] detect tag", text)
    return <span className="tag" onClick={() => {
      if (searchHandler) {
        searchHandler(`#${text}`, true)
      }
    }}>#{text} </span>
  }

  return Tag
}
