import { useContext, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useViewHeight } from "../../lib/useview";
import { MemoModelCtx } from "../../pages/memos";
import Model from "../common/Model";
import { TImage } from "./imagesthumb";

type Props = {
  imagesData: TImage[]
  currentIndex: number
}

export default function ImageBrowser({ imagesData, currentIndex }: Props) {
  const ctx = useContext(MemoModelCtx)
  const [i, setI] = useState(currentIndex)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (i > imagesData.length - 1) console.error("uncaught ivalid image index:", i, "in length", imagesData.length)

  const ratio = useMemo(() => i < imagesData.length ? imagesData[i].width / imagesData[i].height : 1, [imagesData, i])
  const maxHeight = useViewHeight()

  return (ctx.isModel ?
    <Model isModel={true} setModel={ctx.setIsModel}>
      <Container ref={scrollRef}>
        {/*eslint-disable-next-line @next/next/no-img-element*/} {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img loading="lazy" src={imagesData[i].ok === "loaded" ? imagesData[i].src : ""} alt={imagesData[i].ok}
          style={ratio >= 2
            ? { maxWidth: "100%", maxHeight: maxHeight * 0.9 + "px" }
            : ratio > 0.6
              ? { maxWidth: "100%", maxHeight: maxHeight + "px" }
              : { maxWidth: "95%" }} />
      </Container>


      {i > 0
        ? <Button style={{ left: "1rem" }} onClick={(e) => { e.stopPropagation(); setI(i - 1); scrollRef.current ? scrollRef.current.scrollTo({ top: 0 }) : null; }}><i className="icon-arrow-left2" /></Button>
        : null}

      {i < imagesData.length - 1
        ? <Button style={{ right: "1rem" }} onClick={(e) => { e.stopPropagation(); setI(i + 1); scrollRef.current ? scrollRef.current.scrollTo({ top: 0 }) : null; }}><i className="icon-arrow-right2" /></Button>
        : null}

      <Tools>{i + 1}/{imagesData.length}</Tools>

    </Model> : undefined
  )
}

const Tools = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 0.5rem;

  height: 2.5rem;
  border-radius: 1.25rem;
  padding: 0 1rem;
  background: #5b5b5bbd;
  color: white;
  backdrop-filter: blur(5px);

  &:hover{
    opacity: 1;
  }
`

const Button = styled.div`
  
  position: absolute;
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


  &:hover{
    opacity: 1;
    backdrop-filter: blur(5px);
  }
`

const Container = styled.div`
  width: 100%;
  max-height: 100%;
  overflow-y: auto;

  img {
    display: block;
    margin: 0 auto;
  }
`