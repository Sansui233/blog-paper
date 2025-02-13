import { useEffect, useMemo } from "react"
import styled from "styled-components"
import { useViewHeight } from "../../lib/hooks/use-view"

type Props = React.HTMLProps<HTMLDivElement> & {
  isModel: boolean, // 外部传入 model 状态 noun
  setModel: (isOpen: boolean) => void // 内部控制 model 状态 verb
  scrollRef?: HTMLElement // 外部页面的滚动不在 body 上时需要传入相应的元素以禁滚动
}

export default function Model({ isModel, setModel, scrollRef, style, ...otherprops }: Props) {
  const viewHeight = useViewHeight()

  const styles = useMemo(() => style ? {
    ...style,
    height: viewHeight + "px"
  }
    : { height: viewHeight + "px" }, [style, viewHeight])

  // Local Scroll
  useEffect(() => {
    if (isModel) {
      if (!scrollRef) {
        document.body.style.overflow = 'hidden'
      } else {
        scrollRef.style.overflow = 'hidden'
      }
    } else {
      if (!scrollRef) {
        document.body.style.overflow = 'auto'
      } else {
        scrollRef.style.overflow = 'auto'
      }
    }
    return () => {
      if (!scrollRef) {
        document.body.style.overflow = 'auto'
      } else {
        scrollRef.style.overflow = 'auto'
      }
    }
  }, [isModel, scrollRef])

  return isModel
    && <MaskedContainer {...otherprops}
      $isOpen={isModel}
      onClick={(e) => { e.stopPropagation(); setModel(false) }}
      style={styles}
    />
}


// Notice that the bottom will be covered on ios
const MaskedContainer = styled.div< { $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background: #000000de;
  z-index: 10;
  cursor: zoom-out;
  will-change: transform;
`