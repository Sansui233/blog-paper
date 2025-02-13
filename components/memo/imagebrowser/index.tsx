import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { create } from 'zustand';
import { useDocumentEvent } from "../../../lib/hooks/use-event";
import { useViewHeight, useViewWidth } from "../../../lib/hooks/use-view";
import Model from "../../common/model";
import { TImage } from "../imagethumbs";
import { useDrag } from "./use-drag";

export interface ImageBrowserState {
  isModel: boolean;
  setisModel: (b: boolean) => void
  imagesData: Array<TImage>
  setImagesData: (imagesData: TImage[]) => void
  currentIndex: number
  setCurrentIndex: (i: number) => void
}

export const useImageBroswerStore = create<ImageBrowserState>((set) => {
  return {
    isModel: false,
    setisModel: (isModel: boolean) => set(() => ({ isModel })), // wow amazing, partial updating
    imagesData: new Array<TImage>(),
    setImagesData: (imagesData: TImage[]) => set(() => ({ imagesData })),
    currentIndex: 0,
    setCurrentIndex: (currentIndex: number) => set(() => ({ currentIndex })),
  }
})

export default function ImageBrowser() {
  const store = useImageBroswerStore(state => state) // wont update except re-render
  const imagesData = useImageBroswerStore(state => state.imagesData)

  const [index, setIndex] = useState({
    curr: useImageBroswerStore(state => state.currentIndex),
    last: useImageBroswerStore(state => state.currentIndex),
  })
  if (index.curr > imagesData.length - 1) console.error("uncaught invalid image index:", index, "in length", imagesData.length)

  const prev = useCallback(() => {
    if (index.curr > 0) {
      setIndex({
        curr: index.curr - 1,
        last: index.curr
      })
    }
  }, [index, setIndex])

  const next = useCallback(() => {
    if (index.curr < imagesData.length - 1) {
      setIndex({
        curr: index.curr + 1,
        last: index.curr
      })
    }
  }, [index, setIndex, imagesData])

  const reset = useCallback(() => {
  }, [])

  // keyboard shortcut
  const keyevent = useCallback((evt: KeyboardEvent) => {
    if (evt.key === "ArrowLeft") {
      prev()
    } else if (evt.key === "ArrowRight") {
      next()
    }
  }, [next, prev]) // todo throttle?

  useDocumentEvent("keydown", keyevent)

  // mobile Drag
  const { bind, trans, direction, isBeforeUnmount } = useDrag(store, prev, next, reset, 20)
  // console.debug("%, direction", direction)

  const buttonLTrans = useMemo(() => direction === "x" && trans[0] > 60, [trans, direction])
  const buttonRTrans = useMemo(() => direction === "x" && trans[0] < -60, [trans, direction])

  // scroll container
  const maxHeight = useViewHeight()
  const maxWidth = useViewWidth()
  const containerTrans: CSSProperties = useMemo(() => direction === "x"
    ? {
      transition: "transform 0.05s linear",
      transform: `translate3d(${trans[0] - index.curr * maxWidth}px, 0px, 0px)`,
      width: `${maxWidth * imagesData.length}px`
    }
    : {
      transition: "transform 0.5s ease",
      transform: `translate3d(${-index.curr * maxWidth}px, 0px, 0px)`, // triggered with index.curr got change
      width: `${maxWidth * imagesData.length}px`
    }
    , [trans, direction, index.curr, maxWidth, imagesData.length])

  const endTrans: CSSProperties = useMemo(() => isBeforeUnmount ? { opacity: 0, transition: "opacity 0.3s ease" } : {}, [isBeforeUnmount])

  // image container
  const imgMap = useMemo(() => {
    const i = index.curr
    const left = i > 0 ? { i: i - 1, data: imagesData[i - 1] } : { i: i - 1, data: undefined }
    const middle = { i: i, data: imagesData[i] }
    const right = i + 1 < imagesData.length ? { i: i + 1, data: imagesData[i + 1] } : { i: i + 1, data: undefined }
    return [left, middle, right] // logical position. repeated i won't be re-render due to react dom diff
  }, [imagesData, index.curr])

  const styleMap: CSSProperties[] = useMemo(() => imgMap.map(img => {
    const transX = maxWidth * img.i
    const transStyle = {
      transform: `translateX(${transX}px)`,
      width: `${maxWidth}px`,
      height: '100%',
    }
    if (img.data) {
      const ratio = img.data.width === 0 || img.data.height === 0 ? 1 : img.data.width / img.data.height
      if (ratio > 0.6 || img.data.height < maxHeight) {
        return { // 不是超长图则居中。需要子元素高度配合以防止溢出
          ...transStyle,
          display: "flex",
          alignItems: "center",
        }
      } else {
        return {// 长图则滚动，每条独立
          ...transStyle,
          overflowY: "auto",
        }
      }
    }
    return transStyle


  }), [imgMap, maxHeight, maxWidth])

  const xScrollStyle: CSSProperties = useMemo(() => direction === "x" ? { overflowY: "hidden" } : {}, [direction])

  // img style
  const imgStyle = useCallback((img: TImage) => {
    const ratio = img.width === 0 || img.height === 0 ? 1 : img.width / img.height
    const ratioStyle: CSSProperties = ratio >= 2
      ? { maxWidth: maxWidth, maxHeight: maxHeight * 0.9 + "px" } // 宽图
      : ratio > 0.6 || img.height < maxHeight
        ? { maxWidth: maxWidth, maxHeight: maxHeight + "px" } // 正常图，限制短边
        : { maxWidth: maxWidth * 0.95 } // 超长图
    return ratioStyle
  }, [maxHeight, maxWidth])


  return (
    <Model isModel={true} setModel={store.setisModel} style={{ ...endTrans, background: "#1d1d1d" }}>
      {/* Debug */}
      {/* <Tools style={{ bottom: "0rem", flexDirection: "column", height: "12em" }}>
        <div>startpos {startpos.toString()}</div>
        <div>trans {trans.toString()}</div>
        <div>direction {direction}</div>
      </Tools> */}

      <Container
        {...bind}
        onClick={e => e.stopPropagation()}
        style={containerTrans}
      >
        {imgMap.map((m, i) => (
          <ImgContainer key={m.i} style={{
            ...styleMap[i],
            ...xScrollStyle
          }}>
            {m.data && <Img src={m.data.ok === "loaded" ? m.data.src : ""} alt={m.data.ok}
              style={imgStyle(m.data)} />}
          </ImgContainer>
        ))}

      </Container>

      {index.curr > 0
        && <Button $isLeft={true} $isShown={buttonLTrans} onClick={(e) => { e.stopPropagation(); prev() }}><ArrowLeft /></Button>
      }

      {index.curr < imagesData.length - 1
        && <Button $isLeft={false} $isShown={buttonRTrans} onClick={(e) => { e.stopPropagation(); next() }}><ArrowRight /></Button>
      }

      <Tools>{index.curr + 1}/{imagesData.length} &nbsp;|&nbsp;
        <span onClick={(e) => { e.stopPropagation(), store.setisModel(false) }}>{"关闭"}</span></Tools>

    </Model>
  )
}

const ImgContainer = styled.div`
  position: absolute;
  will-change: transform;
`

const Img = styled.img`
  display: block;
  margin: 0 auto;
  
  &::after{
    content: attr(alt);
  }

`

const Tools = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0.5rem;
  right: 0.5rem;

  height: 2.5rem;
  border-radius: 1.25rem;
  padding: 0 1rem;
  background: #5b5b5bbd;
  color: white;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);

  &:hover{
    opacity: 1;
  }
`

const Button = styled.div<{
  $isLeft: boolean
  $isShown: boolean
}>`
  
  position: fixed;
  bottom: calc(50vh - 2.5rem);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 2.5rem;
  height: 2.5rem;
  padding: 0rem;
  color: white;
  opacity: 0.5;
  background: #5b5b5bbd;
  font-size: 1.25rem;
  border-radius: 50%;
  ${p => p.$isLeft ? "left: 1rem;" : "right: 1rem;"}

  @media screen and (max-width: 580px) {
    ${p => p.$isLeft
    ? (p.$isShown ? "left: 1rem;" : "left: -2.5rem;")
    : (p.$isShown ? "right: 1rem;" : "right: -2.5rem;")}
    transition: left 0.3s linear, right 0.3s linear;
  }

  &:hover{
    opacity: 1;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: clip;
  overflow-y: hidden;
  position: relative;
  cursor: default;
  will-change: transform;

  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;	
`