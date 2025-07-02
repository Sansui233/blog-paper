import { HashIcon, MenuSquare, Search, TagIcon, Users, X } from "lucide-react";
import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { ThemeContext } from "styled-components";
import { CommonHead } from "..";
import ButtonFloat from "../../components/common/button-float";
import { LinkWithLine } from "../../components/common/link-with-line";
import Modal from "../../components/common/modal";
import { TwoColLayout } from "../../components/layout";
import CardCommon from "../../components/memo/cardcommon";
import CommentCard from "../../components/memo/commentcard";
import { useImageBroswerStore } from "../../components/memo/imagebrowser";
import MemoCol from "../../components/memo/memocol";
import NavCard from "../../components/memo/navcard";
import Topbar from "../../components/page/topbar";
import { clientList } from "../../lib/data/client";
import { MemoInfo, MemoPost, MemoTag } from "../../lib/data/memos.common";
import { memo_db, writeMemoJson } from "../../lib/data/server";
import { useDocumentEvent } from "../../lib/hooks/use-event";
import useSearch from "../../lib/hooks/use-search";
import { compileMdxMemo } from "../../lib/markdown/mdx";
import { SearchObj } from "../../lib/search";
import { siteInfo } from "../../site.config";
import { fadeInRight } from "../../styles/animations";
import { dropShadow, floatMenu } from "../../styles/css";
import { Extend } from "../../utils/type-utils";

export const MemoCSRAPI = '/data/memos'

const ImageBrowser = dynamic(() => import("../../components/memo/imagebrowser"))
const Waline = dynamic(() => import("../../components/page/waline"))

// TMemo 的 content 是 code……
export type TMemo = Omit<MemoPost, "content"> & {
  code: string,
  length: number
}

type Props = {
  client: keyof typeof clientList,
  source: TMemo[]// 首屏 seo data
  info: Extend<MemoInfo>,
  memotags: MemoTag[], // tagname, memo list
}

export default function Memos({ source, info, memotags, client }: Props) {
  const theme = useContext(ThemeContext)
  const [isMobileSider, setIsMobileSider] = useState(false)
  const [t, i18n] = useTranslation()
  const isImageModal = useImageBroswerStore(state => state.isModal)
  const [isCommentModal, setIsCommentModal] = useState(false)
  const [postsData, setpostsData] = useState(source)
  const [postsDataBackup, setpostsDataBackup] = useState(source)



  // search engine init
  // TODO set page limitation
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchStatus, resetSearchStatus, setTextAndSearch: setSearchText, search, initSearch } = useSearch<TMemo>({
    inputRef,
    setRes: setpostsData,
    initData: async () => {   // fetch data and set search engine
      const urls = Array.from({ length: info.pages + 1 }, (_, i) => `${MemoCSRAPI}/${i}.json`)
      const requests = urls.map(url => fetch(url).then(res => res.json()));
      const resp = await Promise.all(requests)
      const src = (resp as MemoPost[][]).flatMap(v => v)
      const searchObj: SearchObj[] = src.map(memo => ({
        id: memo.id,
        title: "", // 无效化 title。engine 动态构建结果写起来太麻烦了，以后再说。
        content: memo.content,
        tags: memo.tags,
      }))

      return {
        searchObj,
        filterRes: (searchres) => {
          const ids = searchres.map(r => r.id)
          const tmemos: Promise<TMemo>[] = src.filter(memo => {
            if (ids.includes(memo.id)) {
              return true
            }
            return false
          }).map(async memo => {
            return {
              ...memo,
              code: (await compileMdxMemo(memo.content)).code,
              length: memo.content.length
            }
          })
          return tmemos
        }
      }
    }
  })

  // 包装 handle search，空值输入不触发搜索，恢复数据
  const searchBehavior = useCallback(() => {
    if (inputRef.current && inputRef.current.value === "") {
      setpostsData(postsDataBackup)
      resetSearchStatus()
      return
    }
    search()
  }, [search, postsDataBackup, resetSearchStatus]) //TODO

  // bind keyboard event
  useDocumentEvent(
    "keydown",
    (evt) => {
      if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
        searchBehavior()
    },
    undefined,
    [search]
  )

  return (
    <>
      <Head>
        <title>{`${siteInfo.author} - Memos`}</title>
        <CommonHead />
      </Head>
      <Topbar
        placeHolder={false}
        hideSearch={true}
        style={{ borderBottom: "1px solid " + theme?.colors.uiLineGray2 }}
      />
      <main style={{
        background: theme?.colors.bg2
      }}>
        <OneColLayout>
          <ButtonFloat
            className="button-float"
            Icon={MenuSquare}
            clickHandler={(e) => setIsMobileSider(v => !v)}
          />
          <TwoColLayout
            sep={1}
            siderLocation="right"
          >
            <Col>
              <MemoCol
                postsData={postsData} postsDataBackup={postsDataBackup}
                setpostsData={setpostsData} setpostsDataBackup={setpostsDataBackup}
                client={client} searchStatus={searchStatus} resetSearchStatus={resetSearchStatus} setTextAndSearch={setSearchText}
              />
            </Col>
            <SiderContent $isMobileSider={isMobileSider}>
              <div className="close-btn" onClick={(e) => { e.stopPropagation(); setIsMobileSider(v => !v) }}>
                小小の菜单<X size={"1.25em"} style={{ marginLeft: ".5rem" }} />
              </div>
              <MemoSearchBox>
                <input type="text" placeholder={t("search")} ref={inputRef}
                  onFocus={
                    () => { initSearch() }
                  } />
                <Search className="hover-gold" size={"1.4rem"}
                  onClick={searchBehavior}
                />
              </MemoSearchBox>
              <NavCard info={info} />
              <CardCommon
                Icon={TagIcon}
                title={t("tags")}
              >
                {memotags.map(t => {
                  return <span className="hover-gold" style={{ display: "inline-block", paddingRight: "0.75em" }}
                    key={t.name}
                    onClick={() => { setSearchText("#" + t.name) }}
                  >
                    <HashIcon size={"1rem"} style={{ opacity: 0.5, paddingRight: "1px" }} />
                    {`${t.name}`}
                    {t.memoIds.length > 1 ? <span style={{ opacity: 0.5 }}>({t.memoIds.length})</span> : ""}
                  </span>
                })}

              </CardCommon>
              {siteInfo.friends
                && <CardCommon
                  title={t("friends")}
                  Icon={Users}
                >
                  {siteInfo.friends.map((f, i) => <div key={i}><LinkWithLine href={f.link}>{f.name}</LinkWithLine></div>)}
                </CardCommon>
              }
              {siteInfo.walineApi && siteInfo.walineApi !== "" && <CommentCard setIsCommentModal={setIsCommentModal} />}
            </SiderContent>
          </TwoColLayout>
        </OneColLayout>
        {isImageModal && <ImageBrowser />}
        {siteInfo.walineApi && siteInfo.walineApi !== "" &&
          <Modal
            isModal={isCommentModal}
            setModal={setIsCommentModal}
            style={{ background: "transparent" }}
            isAnimated={true}
            showCloseBtn={true}>
            <CommentContainer>
              <Waline onClick={e => e.stopPropagation()} />
            </CommentContainer>
          </Modal>
        }
      </main>
    </>
  )
}


export const getStaticProps: GetStaticProps<Props> = async () => {
  writeMemoJson()

  const memos: TMemo[] = await Promise.all(memo_db.atPage(0).map(async m => {
    const { code } = await compileMdxMemo(m.content)
    return {
      ...m,
      code: code,
      length: m.content.length,
    }
  }))

  return {
    props: {
      client: "static",
      source: memos, // seo on fetch
      info: memo_db.info,
      memotags: memo_db.tags,
    }
  }
}


const OneColLayout = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  .button-float {
    display: none;
  }

  @media screen and (max-width: 780px) {
    max-width: 100%;
    .button-float {
      display: unset;
    }
  }

  @media screen and (max-width: 580px) {
  }
`


/** Styles **/
const Col = styled.div`

width: 100%;
padding: 73px 16px 48px 16px; /* top height + memocard margin */
align-self: flex-end;

&::-webkit-scrollbar {
  display: none;
}

@media screen and (min-width: 1080px) {
  max-width: 780px;
}


@media screen and (max-width: 780px) {
  width: 100%;
}

@media screen and (max-width: 580px) {
  padding-left: 0;
  padding-right: 0;
}
`

const SiderContent = styled.div<{
  $isMobileSider: boolean,
}>`
  position: sticky;

  max-width: 15rem;
  padding-top: 83px; /* top height + memocard margin * 2 */
  padding-bottom: 64px;
  margin: 0 0.5rem;
  height: 100vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  .close-btn {
    display:none;
    z-index: 1;
  }
  
  @media screen and (max-width: 1080px) {
    margin: 0;
  }

  @media screen and (min-width: 780px) {
    animation: ${fadeInRight} 0.5s ease;
  }

  @media screen and (max-width: 780px){
    ${floatMenu}
    position: fixed;
    bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border: 1px solid ${props => props.theme.colors.uiLineGray2};
    border-bottom: none;
    max-width: unset;
    width: 100%;
    height: min(66vh, 500px);
    padding: 0rem 1rem 1rem 1rem;
    transition: transform .3s ease;
    transform: ${p => p.$isMobileSider ? `translateY(0)` : `translateY(105%)`};
    

    .close-btn {
      position: sticky;
      top: 0px;
      background: inherit;
      transform: translateY(-1px);
      border-bottom: 1px solid ${props => props.theme.colors.uiLineGray2};

      display: flex;
      font-weight: 600;
      justify-content: space-between;
      align-items: center;

      padding: 1rem 0 0.75rem 0;
      margin-bottom: 1rem;
      ${p => p.$isMobileSider ? null : `visibility:hidden;`}
      color: ${p => p.theme.colors.textGray2};
      font-size: 1rem;
      cursor:pointer;
    }
    .close-btn:hover{
      color: ${p => p.theme.colors.accent};
    }
  }

  /* util class */
  .hover-gold {
    cursor: pointer;
  }

  .hover-gold:hover {
    color: ${p => p.theme.colors.accent};
  }
`

const MemoSearchBox = styled.div`
  border-radius: 0.5rem;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.textGray};
  display: flex;
  align-items: center;
  margin: 0 1rem; /* 无 bg 时*/
  border: 1px solid ${p => p.theme.colors.uiLineGray2};
  box-shadow: 0 0 12px 0 ${props => props.theme.colors.shadowBg};

  &:focus-within {
    border: 1px solid ${p => p.theme.colors.accentHover};
  }

  input {
    border: none;
    background: inherit;
    line-height: 2rem;
    color: inherit;
    flex: 1 1 auto;
    width: 0;
    margin-left: 1rem;
  }

  input:focus,
  input:focus-visible {
    outline: none;
  }

  input::placeholder {
    color: ${p => p.theme.colors.textGray3};
  }

  svg {
    margin: 0 auto;
    flex: 0  0 auto;
    margin: 0 0.6rem 0 0.5rem;
    color: ${p => p.theme.colors.uiLineGray};
  }
`

const CommentContainer = styled.div`
  height:100%;
  width: 100%;
  overflow-y: auto;
  max-width: 780px;
  margin: 0 auto;
  background: ${p => p.theme.colors.bg};

  padding-top: 2rem; /* avoid close bar conflict */
  padding-bottom: 2rem; /* avoid close bar conflict */

  ${dropShadow}

  &>div{
    max-width: min(90%, 780px);
    cursor: default;
  }

  @media screen and (min-width: 780px) {
    height: 96vh;
    margin-top: 2vh;
    border-radius: 0.5rem;
  }
`