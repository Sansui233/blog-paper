import { WalineComment } from '@waline/client'
import i18next from 'i18next'
import { MessageSquare, PencilLine } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { siteInfo } from '../../site.config'
import { dropShadowAccent } from '../../styles/css'
import Model from '../common/model'
import CardCommon from './cardcommon'

// api doc: https://waline.js.org/reference/server/api.html
// xxx.com/comment?path=%2Fmemos&pageSize=10&page=1&lang=en-US&sortBy=insertedAt_desc

const Waline = dynamic(() => import("../page/waline"))

export default function CommentCard() {
  const theme = useContext(ThemeContext)
  const [comments, setComments] = useState<Array<Pick<WalineComment, "objectId" | "comment">>>([{ objectId: "0x00", comment: "等等，好像没有评论哦~" }])
  const [isModel, setIsModel] = useState(false)

  useEffect(() => {
    const path = encodeURIComponent(globalThis.location.pathname)
    fetch(siteInfo.walineApi + "/comment?path=" + path + "&pageSize=10&page=1&lang=en-US&sortBy=insertedAt_desc")
      .then(res => res.json())
      .then(data => {
        setComments(data.data)
      })
  }, [])

  return (
    <>
      {isModel && <Model isModel={isModel} setModel={setIsModel} style={{ background: theme?.colors.bgMask }}>
        <ModelContainer>
          <Waline onClick={e => e.stopPropagation()} />
        </ModelContainer>
      </Model>
      }

      <CardCommon title={i18next.t("latestcomments")} Icon={MessageSquare}>
        <Container>
          {comments.map(item => <li key={item.objectId}>{item.comment.replace(/<[^>]*>/g, '')}</li>)}
        </Container>
        <ModelButton>
          <PencilLine size="1em" style={{ marginRight: "0.5em" }} />
          <span onClick={() => setIsModel(true)}>
            添加留言
          </span>
        </ModelButton>
      </CardCommon>
    </>
  )
}

const Container = styled.div`
  font-size: 0.9rem;
  
  li {
    list-style: none;
    height: 1.5em;
    overflow: hidden;
  }
`
const ModelButton = styled.button`
  margin-top: 2rem;
  max-width: 8rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${p => p.theme.colors.uiLineGray2};

  font-weight: 600;
  color:${p => p.theme.colors.textSecondary};
  cursor: pointer;
  background: ${props => props.theme.colors.bg};
  box-shadow: 0 0 12px 0 ${props => props.theme.colors.shadowBg};


  @media screen and (max-width: 780px) {
    max-width: unset;
    background: ${props => props.theme.colors.bg2};
  }

  &:hover {
    color:${p => p.theme.colors.accent};
    ${dropShadowAccent}
  }
`

const ModelContainer = styled.div`
  height:100%;
  width:100%;
  padding-top:64px;
  overflow-y: auto;

  &>div{
    max-width: min(90%, 640px);
    cursor: default;
  }
`
