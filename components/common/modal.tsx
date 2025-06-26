import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { useViewHeight } from "../../lib/hooks/use-view"
import { focusIn, focusOut } from "../../styles/animations"
import { dropShadow } from "../../styles/css"

type Props = React.HTMLProps<HTMLDivElement> & {
  isModal: boolean, // 外部传入 model 状态 noun
  setModal: (isOpen: boolean) => void // 内部控制 model 状态 verb
  isAnimated?: boolean
  showCloseBtn?: boolean
  scrollRef?: HTMLElement // 外部页面的滚动不在 body 上时需要传入相应的元素以禁滚动
}

export default function Modal({ isModal, setModal, scrollRef, isAnimated, showCloseBtn, style, children, ...otherprops }: Props) {
  const viewHeight = useViewHeight()
  const [isBeforeClose, setIsBeforeClose] = useState(false)

  const close = () => {
    if (isAnimated) {
      // delayed close
      setIsBeforeClose(true)
      setTimeout(() => {
        setModal(false)
        setIsBeforeClose(false)
      }, 300)
    } else {
      // directly close
      setModal(false)
    }
  }

  const styles = useMemo(() => style ? {
    ...style,
    height: viewHeight + "px"
  }
    : { height: viewHeight + "px" }, [style, viewHeight])

  // Local Scroll
  useEffect(() => {
    if (isModal) {
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
  }, [isModal, scrollRef])

  return isModal && <MaskedContainer {...otherprops}
    onClick={(e) => {
      e.stopPropagation();
      close()
    }}
    style={styles}
    className={isAnimated ? isBeforeClose ? "close" : "show" : undefined}
  >
    {children}
    {showCloseBtn && <CloseBar>
      <div className="close" onClick={(e) => { e.stopPropagation(); close() }}> Close <X size={"1.25em"} /></div>
    </CloseBar>}
  </MaskedContainer>
}


// Notice that the bottom will be covered on ios
const MaskedContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background: #000000de;
  z-index: 10;
  cursor: zoom-out;
  will-change: transform;

  &.show {
    animation: ${focusIn} .3s ease;
    animation-fill-mode: forwards;
  }
  &.close {
    animation: ${focusOut} .3s ease;
    animation-fill-mode: forwards;
  }
`

const CloseBar = styled.div`
  position: fixed;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.5rem;
  top: 0.5rem;
  pointer-event: none;
  
  display: flex;
  justify-content: flex-end;

  color: ${props => props.theme.colors.textGray3};
  
  &:hover {
    color: ${props => props.theme.colors.textPrimary};
  }

  @media screen and (max-width: 780px) {
    top: unset;
    bottom: 0.5rem;
    justify-content: center;
  }
  .close {
    cursor: pointer;
    border-radius: 0.5rem;
    backdrop-filter: blur(8px);
    padding: 0.3rem 0.5rem;
    ${dropShadow}
    border: solid 1px ${props => props.theme.colors.uiLineGray2};

    display: flex;
    align-items: center;
  }

`