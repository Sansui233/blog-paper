import { Github, Mail, Rss } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import styled from "styled-components"
import useAppState, { ThemeMsg } from "../../../lib/app-states"
import { siteInfo } from "../../../site.config"
import MenuIcon from "./menuicon"
import { focusIn, slideInLeft, topFadeIn } from "../../../styles/animations"

type Props = {
  isShow: boolean,
  toggle: () => void
}

export default function Sidebar({ isShow, toggle }: Props) {
  const appState = useAppState()

  function handleThemeChange() {
    const t = appState.theme
    const targetTheme = (t === 'system' ?
      'dark' : t === 'dark' ?
        'light' : 'system') as ThemeMsg;
    appState.setTheme(targetTheme)
  }

  const themeText = useMemo(() => {
    const t = appState.theme
    return t === 'system' ? '系统外观' :
      t === 'dark' ? '夜间模式'
        : '日间模式'
  }, [appState])

  return (
    <Container className={isShow ? "is-show":"is-hide"}>
      <Content style={{ paddingTop: '8rem' }}>
        <h1 data-i={"0"}>
          <span>
            {"SANSUI'S BLOG"}
          </span>
        </h1>
        <div data-i={"1"} onClick={handleThemeChange}>
          <OptionText>
            {themeText}
          </OptionText>
        </div>
        <div data-i={"2"}><OptionText><Link href="/categories">分类标签</Link></OptionText></div>
        <div data-i={"3"}><OptionText><Link href="/atom.xml">RSS</Link></OptionText></div>
        <LastSection data-i={"4"}>
          <Icons>
            <a href={siteInfo.social.github}><Github /></a>
            <a href={`mailto:${siteInfo.social.email}`}><Mail /></a>
            <a href="/rss"><Rss /></a>
          </Icons>
          <div style={{ margin: "1rem auto" }}>Sansui 2025<br />All rights reserved</div>
        </LastSection>
      </Content>
      <PositionedClose>
        <MenuIcon isClose={true} isCloseToggler={toggle} />
      </PositionedClose>
    </Container>)
}

const PositionedClose = styled.div`
  width: 24px;
  height: 20px;
  position: fixed;
  top: 22px;
  right: 20px;
`

const LastSection = styled.div`
  font-weight: 400;
  padding-top: 3rem;
  font-size: 0.625rem;
`

const Icons = styled.div`
  margin: 1rem 0;

  a:hover {
    color: ${p => p.theme.colors.accentHover};
  }

  svg {
    font-size: 1.5rem;
    margin: 0 0.25rem;
  }
`

const Container = styled.section`
  background: ${p => p.theme.colors.bg};
  overflow: auto;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 9;
  opacity: 0;
  backdrop-filter: blur(6px);
  transition: all 0.5s cubic-bezier(0.46, 0, 0.08, 1.11);
  pointer-events: none;
  
  &.is-show {
    opacity: 1;
    pointer-events: auto;
  }

  h1 {
    span{
      position: relative;
    }
    span::before {
      content:'';
      position: absolute;
      left:0;
      bottom: 0;
      width: 100%;
      border-radius: 0.5em;
      height: 0.5em;
      background: ${p => p.theme.colors.accentHover};
      mix-blend-mode: ${p => p.theme.colors.bgFilter};
    }
  }
  
  &.is-show [data-i]{
    opacity: 0;
    animation: ${topFadeIn} 1s ease forwards;
  }
  
  [data-i="1"] {
    animation-delay: 0.1s !important;
  }
  [data-i="2"]{
    animation-delay: 0.2s  !important;
  }
  [data-i="3"]{
    animation-delay: 0.3s  !important;
  }
  [data-i="4"]{
    animation-delay: 0.4s  !important;
  }
  

`

const Content = styled.div`
  margin: 0 auto;
  padding: 92px 0px;
  text-align: center;
  font-weight: bold;
`

const OptionText = styled.span`

  font-size: 1.625rem;
  line-height: 2.75rem;
  position: relative;
  transition: box-shadow .3s ease;
  cursor: pointer;

  &:hover {
    color: ${p => p.theme.colors.accentHover};
    transform: scale(1.2);
  }
`
