import { ChevronDown, Search } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import styled from "styled-components"
import Neko from "../../../assets/neko.svg"
import { throttle } from "../../../lib/throttle"
import { siteInfo } from "../../../site.config"
import { fadeInTop } from "../../../styles/animations"
import { dropShadowSoft, hoverRound } from "../../../styles/css"
import { LinkWithLine } from "../../styled/link-with-line"
import MenuIcon from "./menuicon"
import Sidebar from "./sidebar"

type Props = React.HTMLProps<HTMLElement> & {
  placeHolder?: boolean; // 有一些布局不需要 placeHolder
  scrollElem?: HTMLElement; // 滚动时自动隐藏的监听元素，默认是GlobalThis
  hideSearch?: boolean;
}

const LazySearchBox = dynamic(() => import('../searchbox'), {})

export default function Topbar({ placeHolder = true, scrollElem, hideSearch, ...otherProps }: Props) {
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)
  const [isSearch, setisSearch] = useState(false)
  const router = useRouter()
  const searchIcon = useRef<HTMLDivElement>(null)
  const [t, i18n] = useTranslation()
  const [isDropperOpen, setIsDropperOpen] = useState(false)

  /**
   * Hide on scroll
   */
  useEffect(() => {

    let elem: HTMLElement | typeof globalThis = globalThis;

    if (scrollElem) {
      elem = scrollElem
    }

    const getScrollPos = () => {
      if (scrollElem && scrollElem instanceof HTMLElement) {
        return scrollElem.scrollTop
      } else {
        return globalThis.scrollY
      }
    }

    let previousTop = getScrollPos()

    const onScroll: EventListener = () => { // <-- DOM-EventListener
      if (getScrollPos() < 200) { // ignore on page top
        setisHidden(false)
        previousTop = getScrollPos()
        return
      }

      const distance = getScrollPos() - previousTop

      if (distance > 10) {
        setisHidden(true)
        previousTop = getScrollPos()
      } else if (distance < -10) {
        setisHidden(false)
        previousTop = getScrollPos()
      }
    };

    const throttled = throttle(onScroll, 100)
    elem.addEventListener("scroll", throttled);


    return () => {
      elem.removeEventListener("scroll", throttled)
    };
  }, [scrollElem])

  const toggleSidebar = () => {
    setIsSidebar(!isSidebar)
  }

  const clickSearch = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setisSearch(!isSearch)
  }

  const updateSearch = (innerState: boolean) => {
    setisSearch(innerState)
  }

  return (
    <React.Fragment>
      <LazySearchBox outSetSearch={updateSearch} outIsShow={isSearch} iconEle={searchIcon} />
      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />
      <Layout $isHidden={isHidden} {...otherProps}>
        <Avatar >
          <Link href="/" passHref={true} style={{ padding: "0 1rem" }}>
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <Neko width="36" />
            <span>{`${siteInfo.author}'s 's blog`}</span>
          </Link>
        </Avatar>
        <Nav>
          <ol className={router.pathname === "/" || router.pathname.startsWith("/posts") ? 'current' : ''}><LinkWithLine href="/">{t('posts')}</LinkWithLine></ol>
          <ol className={router.pathname === "/memos" ? 'current' : ''}><LinkWithLine href="/memos">{t('memos')}</LinkWithLine></ol>
          <ol className={router.pathname === "/about" ? 'current' : ''}><LinkWithLine href="/about">{t('about')}</LinkWithLine></ol>
        </Nav>
        <More>
          <MobileNav>
            <div className={"subnav " + (isDropperOpen ? "open" : "")}>
              {router.pathname !== "/" && !router.pathname.startsWith("/posts") && <Link href="/">{t('posts')}</Link>}
              {!router.pathname.startsWith("/memos") && <Link href="/memos">{t('memos')}</Link>}
              {!router.pathname.startsWith("/about") && <Link href="/about">{t('about')}</Link>}
            </div>
            <button style={{ position: "relative" }} onClick={() => setIsDropperOpen(v => !v)}>
              {router.pathname === "/" || router.pathname.startsWith("/posts") ? t('posts')
                : router.pathname === "/memos" ? t('memos')
                  : router.pathname === "/about" ? t('about') : ""}
              <ChevronDown size={"1.25em"} style={{ marginRight: "-0.5rem" }} />
            </button>
          </MobileNav>
          <SearchIcon ref={searchIcon} onClick={(e) => { hideSearch ? null : clickSearch(e) }} $isSearch={isSearch} $hideSearch={hideSearch}>
            <Search />
          </SearchIcon>
          <div onClick={toggleSidebar} style={{ marginRight: "20px", width: "22px" }}>
            <MenuIcon width={"100%"} height={"1.15rem"} isClose={isSidebar} />
          </div>
        </More>
      </Layout>
      {placeHolder === false ? null : <PlaceHolder>
        人活着就是为了卡卡西
      </PlaceHolder>}
    </React.Fragment>
  );
}

const SearchIcon = styled.div<{ $isSearch: boolean, $hideSearch: boolean | undefined }>`
  ${p => p.$hideSearch && "display: none;"}
  ${p => p.$isSearch ? "color:" + p.theme.colors.accent + ";" : ""}
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: ${p => p.theme.colors.accentHover};
  }

  @media screen and (max-width: 780px) {
    ${p => p.$hideSearch && "display:none;"}
  }

`
const PlaceHolder = styled.div`
    height: 63px;
    width: 100%;
    text-align: center;
    padding-top: 0.625rem;
    font-size: 0.625rem;
    font-style: italic;
    color: ${p => p.theme.colors.accent};
    font-family: 'Times New Roman', STSong, '宋体', serif;
    opacity: .6;
`
const Layout = styled.header<{
  $isHidden: boolean
}>`
  height: 63px;
  width: 100%;
  box-sizing: content-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  background-color: ${(props => props.theme.colors.bg)};
  z-index:10;
  transform: ${props => props.$isHidden ? "translateY(-100%)" : "translateY(0)"};
  transition: transform .5s ease;
`

const Avatar = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 600;
  width: 210px;

  span {
    padding: 0 0.5rem;
  }

  @media screen and (max-width: 780px){
    width: 100px;
    span {
      display: none;
    }
  }
  @media screen and (max-width: 350px){
    display: none
  }
`
const Nav = styled.nav`
  flex: 2 1 auto;
  display: flex;
  justify-content: space-evenly;
  letter-spacing: 0.02em;
  align-items: center;
  font-size: 1.125rem;


  @media screen and (min-width: 780px) {
    max-width: 50%;
  }
  @media screen and (min-width: 580px) {
    max-width: 390px;
  }
  @media screen and (max-width: 580px) {
    max-width: 290px;
    display: none;
  }
  

  ol {
    padding: 0 .5em;
    padding-top: 2px;
    font-weight: 600;
  }

  ol.current a{
    position: relative;
  }
  ol.current a:before {
    ${hoverRound}
  }

`

const More = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 210px;
  
  & > div {
    margin-right: 15px;
  }

  @media screen and (max-width: 780px){
    width: 100px;
  }
`

const MobileNav = styled.div`
display: flex;
flex-direction: column;
font-size: 1.25rem;
font-weight: 600;
position: relative;
min-width: 57px;

button {
  color: ${props => props.theme.colors.textPrimary};
  padding: 0 0.75rem;
}

.subnav {
  visibility: hidden;
  position: absolute;
  top: -0.5rem;
  left: 0em;
  padding: 0;
  width: 100%;
}

.subnav.open {
  visibility: visible;
  border-radius: 0.75rem;
  border: solid 1px ${props => props.theme.colors.uiLineGray2};
  background-color: ${props => props.theme.colors.bg};
  ${dropShadowSoft}
}

.subnav.open > a {
  display: block;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0;
  padding: 0 0.25rem 0.25rem 0.25rem;
  


  animation: ${fadeInTop} 0.8s ease;

  &:first-child {
    margin-top: 2.75rem;
    padding-top: 0.5rem;
    border-top: solid 1px ${props => props.theme.colors.uiLineGray2};
  }
}

@media screen and (min-width: 580px) {
  display: none;
}
`