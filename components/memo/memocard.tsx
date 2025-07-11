import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { dateToYMDMM } from "../../lib/date";
import { TMemo } from "../../pages/memos";
import { siteInfo } from "../../site.config";
import { bottomFadeIn } from "../../styles/animations";
import { textShadow } from "../../styles/css";
import { MarkdownStyle } from "../markdown/markdown-style";
import { useMdxMemo } from "../markdown/mdx";
import { ImageThumbs } from "./imagethumbs";

export type MemoCardProps = {
  source: TMemo;
  setSearchText: (text: string, immediateSearch?: boolean) => void;
  triggerHeightChange?: Dispatch<SetStateAction<boolean>>;
} & React.HTMLProps<HTMLElement>

export function MemoCard({ source, setSearchText, triggerHeightChange, ...otherprops }: MemoCardProps) {
  const [isCollapse, setfisCollapse] = useState(true);
  const theme = useContext(ThemeContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter()

  const shouldCollapse = source.length > 200 ? true : false;

  const date = useMemo(() => {
    const d = new Date(source.id)
    if (d.toString() !== "Invalid Date") {
      return dateToYMDMM(d)
    } else {
      return source.id
    }
  }, [source.id])

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    // Set Collapse
    if (!isCollapse) {
      const element = ref.current;
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < 0 || elementTop > window.innerHeight) {
          globalThis.scrollTo({
            top: elementTop + globalThis.scrollY,
          });
        }
      }
    }
    setfisCollapse(!isCollapse);

    // height change
    if (ref.current && triggerHeightChange) {
      triggerHeightChange(true)
    }
  }

  const handleClickTag = useCallback((tag: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tag: encodeURIComponent(tag.substring(1)) },
    }, undefined, { shallow: true })
  }, [router])

  return (
    <MemoCardStyle {...otherprops} $isCollapse={shouldCollapse === false ? false : isCollapse} ref={ref}>
      <div className="content">
        <MemoMeta>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img className="avatar" src={theme!.assets.favico} alt={siteInfo.author} />
          <div className="meta-text">
            <span className="author" >{siteInfo.author}</span>
            <span className="meta-sm date">
              {date}
            </span>
            <span className="meta-sm word-count">{source.length}&nbsp;字</span>
          </div>
        </MemoMeta>
        <MemoMarkdown $bottomSpace={shouldCollapse}>
          {useMdxMemo(source.code, handleClickTag)}
        </MemoMarkdown>
        <CardMask $isCollapse={isCollapse} $isShown={shouldCollapse}>
          <div onClick={handleExpand} className="rd-more">
            <span>{isCollapse ? "展开全文" : "收起"}</span>
          </div>
        </CardMask>
      </div>
      {
        source.imgsmd.length !== 0
        && <ImageThumbs imgsmd={source.imgsmd} />
      }


    </MemoCardStyle>
  );
}

export function MemoLoading() {
  return <MemoCardStyle $isCollapse={false}>
    <span style={{ opacity: 0.35, fontWeight: "bold" }}>Loading...</span>
  </MemoCardStyle>
}

const MemoCardStyle = styled.section<{
  $isCollapse: boolean
}>`

  background:${p => p.theme.colors.bg};
  padding: 1.25rem 1.5rem;
  animation: ${bottomFadeIn} .3s ease;

  @media screen and (max-width: 580px) {
    padding: 1rem;
    border-radius: unset;
  }
  
  & > .content {
    position: relative;
    height: ${props => props.$isCollapse === true ? "18.2rem" : "auto"};
    overflow: hidden;
    /* transition: height 0.5s ease; */
  }
`


const CardMask = styled.div<{
  $isCollapse: boolean,
  $isShown: boolean
}>`
    display: ${props => props.$isShown === true ? "block" : "none"};
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 7rem;
    text-align: right;
    
    color: ${p => p.theme.colors.accent};
    ${props => props.$isCollapse === true ? props.theme.colors.maskGradient : ''}

    .rd-more {
      font-size: 0.875rem;
      letter-spacing: 0.02rem;
      margin-top: 5.5rem;;
      cursor: pointer;
      span {
        transition: box-shadow .3s;
        margin-right: 0.5rem;
      }
    }

    & .rd-more:hover span {
      ${() => textShadow.f}
    }
   
`

const MemoMarkdown = styled(MarkdownStyle) <{
  $bottomSpace: boolean,
}>`
    padding-bottom: ${props => props.$bottomSpace === true ? "2rem" : "inherit"};
    padding-left: 48px; /* 头像的 40px + 8px */

    p,
    ul,
    ol {
      line-height: 1.625rem;
    }
    
    
    h1,h2,h3,h4,h5,h6 {
      font-size: 1rem;
    }

    & .tag {
      color: ${p => p.theme.colors.accent};
    }

    & .tag:hover {
      cursor: pointer;
      color: ${p => p.theme.colors.accentHover};
    }
`

const MemoMeta = styled.div`
    display: flex;
    align-items: center;
      
    & .avatar {
      width: 40px;
      height: 40px;
      margin-right: 8px;
      border-radius: 50%;
      border: 1px solid ${p => p.theme.colors.uiLineGray};
    }

    & .meta-text {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }

    & .meta-sm {
      color: ${p => p.theme.colors.textGray};
      font-size: 0.8rem;
    }
    
    & .author {
      color: ${p => p.theme.colors.textSecondary};
      margin-right: 0.25rem;
      font-weight: 600;
    }

    & .date {
    }

    & .word-count {
      position: absolute;
      right: 0;
    }
`
