import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Naive, Result, createNaive } from '../../lib/search';
import { SearchObj } from '../../lib/search/common';
import { debounce } from '../../lib/throttle';
import PopOver from '../common/pop-over';

type Props = {
  outSetSearch: (isShow: boolean) => void
  outIsShow: boolean
  iconEle: React.RefObject<HTMLDivElement> // 这个组件有从内部控制外部，但外部的搜索图标是随便放的，在判断点击外部区部时要排除
  type?: "article" | "memo"
}


function SearchBox({ outSetSearch: outShow, outIsShow: outstate, iconEle, type = "article" }: Props) {
  const [engine, setEngine] = useState<Naive>()
  const [res, setres] = useState<Required<Result>[]>([])
  const [isShow, setIsShow] = useState(outstate)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReady, setisReady] = useState(false)

  /**
   * UI control
   */
  const toggle = useCallback((b: boolean) => {
    outShow(b) // to outside
    setIsShow(b) // inside
  }, [outShow])

  useEffect(() => {
    setIsShow(outstate)
  }, [outstate])

  // Click Outside to close
  // Esc to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Node inherit from EventTarget
      const clickSearchBox = containerRef.current && containerRef.current.contains((e.target as Node))
      const clickSearchIcon = iconEle.current && iconEle.current?.contains((e.target as Node))
      if (!clickSearchBox && !clickSearchIcon) {
        toggle(false)
      }
    }

    document.addEventListener('pointerdown', (e) => handleClick(e), false);

    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        toggle(false)
      }
    }
    document.addEventListener('keydown', (e) => { close(e) }, false)

    return () => {
      document.removeEventListener('pointerdown', (e) => handleClick(e), false);
      document.removeEventListener('keydown', (e) => { close(e) }, false)
    }
  }, [iconEle, toggle])

  // Focus on open
  useEffect(() => {
    if (isShow) {
      inputRef.current?.focus()
    }
  }, [isShow])

  /**
   * Get data
   */
  useEffect(() => {
    if (!isReady && isShow) {
      if (type === "article") {
        fetch('/data/posts/index.json')
          .then(res => res.json())
          .then((data) => {
            const newEngine = createNaive({
              data: data as SearchObj[],
              field: ["title", "description", "keywords", "content"],
              notifier: setres
            })
            setEngine(newEngine)
            setisReady(true)
          })
      } else {
        // 预留其他类型的搜索处理位置
      }
    }
  }, [type, isReady, isShow])

  const handleInput = debounce(function (e: FormEvent<HTMLInputElement>) {
    const strs = (e.target as HTMLInputElement).value.split(" ")
    inputRef.current && engine?.search(strs)
  }, 300)

  function highlightSlot(s: string, patterns: string | string[] | undefined) {
    if (!patterns) return s

    if (typeof patterns === "string") {
      patterns = [patterns]
    }

    const regexPattern = new RegExp(`(${patterns.join('|')})`, 'gi');
    const matches = s.split(regexPattern);

    return (
      <>
        {matches.map((match, index) => {
          if (regexPattern.test(match)) {
            return <mark key={index}>{match}</mark>;
          } else {
            return <span key={index}>{match}</span>;
          }

        })}
      </>
    );
  }

  return (
    <Container ref={containerRef} style={isShow ? {} : { display: "none" }}>
      <StickyContainer style={{ padding: "1rem 1rem 0 1rem" }}>
        <SearchInput type="text" placeholder="搜索你感兴趣的内容，以空格分词"
          ref={inputRef}
          onInput={handleInput} />
      </StickyContainer>
      <ScrollContainer style={{ padding: "0.5rem 1rem " }}>
        {isReady
          ? res.map((r, i) => {
            const id = r.id.substring(0, r.id.lastIndexOf(".")); // remove suffix
            return <Item href={`/posts/${id}`} key={i} onClick={() => { toggle(false) }}>
              <span>{highlightSlot(r.title, r.matches?.map(e => e.word))}</span>
              {r.matches?.map(
                e => e.excerpt && <Excerpt key={e.word}>{highlightSlot(e.excerpt, e.word)}</Excerpt>
              )}
            </Item>
          })
          : <div style={{ fontSize: "0.875rem", opacity: 0.5 }}>
            <Excerpt>搜索初始化中……</Excerpt>
          </div>}
      </ScrollContainer>
    </Container>
  )
}

const ScrollContainer = styled.div`
  overflow-y: scroll;
  max-height: 60vh;
`

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${p => p.theme.colors.bg};
`

const SearchInput = styled.input`
  border: none;
  /*border-bottom: 1px solid ${p => p.theme.colors.uiLineGray};*/
  border-radius: 0;
  background: ${p => p.theme.colors.bg};
  width: 100%;
  color: ${p => p.theme.colors.textPrimary};


  &:focus,
  &:focus-visible{
    outline: none;
    /*border-bottom: 1px solid ${p => p.theme.colors.accentHover};*/
  }
`

const Item = styled(Link)`
  padding: 0.375rem 0;
  display: block;
  padding-left: 1rem;

  
  &:hover>span{
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.accentHover};
  }

  &>span {
    transition: box-shadow .5s;
    position: relative;
  }

  &>span::before {
    content: "•";
    color: ${p => p.theme.colors.accent};
    left: -0.875rem;
    position: absolute;
  }
  
`

const Excerpt = styled.div`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textGray};
  overflow: hidden;
  white-space: nowrap;
  wrap: no-wrap;
`

const Container = styled(PopOver)`
  min-height: unset;
  position: fixed;
  top: 55px;
  right: 0px;
  width: 24rem;
  overflow: hidden;
  margin: 0 10px;
  border: 1px solid ${props => props.theme.colors.uiLineGray2};
  
  & mark {
    background: none;
    color: ${p => p.theme.colors.accent}
  }

  @media screen and (max-width: 580px){
    width: 96%;
    max-height:50%
  }
`

export default SearchBox
