import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { throttle } from "../../lib/throttle"

type Props = {
  // 如果有需要可以适配其他类型，还有高度字号什么的。自用组件就算了不写这么多
  items: [string, number][] // Name and Value
  current: number
  setCurrent: (num: number) => void
}

export default function NavCat({ items, current, setCurrent }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [isMouseInside, setIsMouseInside] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => {
      setIsMouseInside(true);
    };

    const handleMouseLeave = () => {
      setIsMouseInside(false);
    };

    if (ref.current) {
      ref.current.addEventListener('mouseenter', handleMouseEnter);
      ref.current.addEventListener('mouseleave', handleMouseLeave);
    }


    const handleWheel = function (e: WheelEvent) {
      if (ref.current && isMouseInside) {
        e.preventDefault()
        ref.current.scrollLeft += e.deltaY;
      }
    }
    const throttledWheel = throttle(handleWheel, 20)

    window.addEventListener("wheel", throttledWheel, { passive: false });

    const r = ref.current

    return () => {

      window.removeEventListener("wheel", throttledWheel)
      if (r) {
        r.removeEventListener('mouseenter', handleMouseEnter);
        r.removeEventListener('mouseleave', handleMouseLeave);
      }

    }
  })

  return <NavLayout ref={ref}>
    {items.map((item, i) => {
      const isCurrent = current === i
      return <Button key={i} onClick={() => { setCurrent(i) }} className={isCurrent ? "current" : undefined}>
        <span>{item[0]}{' '}{item[1]}</span>
      </Button>
    })}
  </NavLayout>

}

const NavLayout = styled.nav`
  display: flex;
  margin-top: 1rem;
  padding: 1rem 0 1rem 0;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none
  }
  position: sticky;
  top: -1px;
  background: ${props => props.theme.colors.bg};
  z-index: 1;
`

const Button = styled.button`
font-size: .875rem;
padding: 0.3rem 0.625rem;
margin-right: 1rem;
cursor: pointer;
border-radius: 0.375rem;
border: 1px solid ${props => props.theme.colors.uiLineGray2};
text-wrap: nowrap;
color: ${props => props.theme.colors.textGray};
transition: all 0.5s ease;


&:hover {
  background: ${props => props.theme.colors.hoverBg};
}

&.current {
border-color: ${props => props.theme.colors.bgInverse};
background: ${props => props.theme.colors.bgInverse};
color: ${props => props.theme.colors.bg};
}


`