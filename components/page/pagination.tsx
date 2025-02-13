import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback } from 'react'
import styled from 'styled-components'

type Props = {
  nextPage?: {
    title: string,
    link: string,
  }
  prevPage?: {
    title: string,
    link: string,
  },
  currTitle?: string,
  maxPage?: string,
  elemProps?: React.HTMLProps<HTMLDivElement>,
  isScrollToTop?: boolean // scroll to top when click next page
  scrollRef?: React.RefObject<HTMLDivElement>
}

const Pagination: React.FC<Props> = (props) => {
  const scroll = useCallback(() => {
    if (!props.isScrollToTop) return
    if (props.scrollRef?.current) {
      props.scrollRef.current.scrollTo({ top: 0 })
    } else {
      globalThis.scrollTo({ top: 0 })
    }
  }, [props.isScrollToTop, props.scrollRef])
  return (
    <Layout {...props.elemProps}>
      {props.prevPage &&
        <div style={{ flex: "1 1 auto" }}>
          <PageBtn href={props.prevPage.link} passHref={true} style={{ justifyContent: "flex-start" }} onClick={scroll}>
            <ArrowLeft size={"1em"} /><span style={{ margin: "0 0.5em" }}>{props.prevPage.title}</span>
          </PageBtn>
        </div>
      }
      <span>{props.currTitle ? props.currTitle.concat((props.maxPage
        ? " / ".concat(props.maxPage) : "")) : ''}</span>

      {props.nextPage &&
        <div style={{ flex: "1 1 auto" }}>
          <PageBtn href={props.nextPage.link} passHref={true} style={{ justifyContent: "flex-end" }} onClick={scroll}>
            <span style={{ margin: "0 0.5em" }}>{props.nextPage.title}</span><ArrowRight size={"1em"} />
          </PageBtn>
        </div>
      }
    </Layout >
  );
}

const Layout = styled.div`
  margin: 64px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  & > span {
    color: ${p => p.theme.colors.textGray};
    font-size: 0.875rem;
  }
`

const PageBtn = styled(Link)`
  padding: .2em 0;
  display: flex;
  align-items: center;
  position: relative;
  
  svg {
    transform: translateY(-0.05em);
  }

  span {
    position: relative;
  }

  span::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    border-radius: 2px;
    background: ${props => props.theme.colors.accentHover};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }
    
  span:hover::before {
    width: 100%;
  }
`


export default Pagination