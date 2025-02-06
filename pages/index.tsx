import { Folder } from 'lucide-react'
import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import LayoutContainer, { OneColLayout } from '../components/layout'
import NavCat from '../components/post/navcat'
import { POST_DIR, buildIndex, posts_db } from '../lib/data/server'
import { dateI18n, parseDate } from '../lib/date'
import { siteInfo } from '../site.config'
import { bottomFadeIn } from '../styles/animations'
import { hoverBoxShadow } from '../styles/css'

type PostType = {
  id: string,
  date: string,
  title?: string,
  categories?: string,
  description?: string,
  tags?: string | string[],
}

type Props = {
  posts: PostType[],
  categories: [string, number][]
}


export const CommonHead = () => (
  <React.Fragment>
    <meta name="description" content="A personal blog about work and life" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
    <link rel="icon" href="/favicon.ico" />
  </React.Fragment>
)

const Home: NextPage<Props> = ({ posts, categories }: Props) => {
  const [currCategory, setCurrCategory] = useState(0)

  const filteredPosts = useMemo<PostType[]>(() => {
    if (currCategory === 0) {
      return posts
    } else {
      return posts.filter(p => {
        return p.categories === categories[currCategory][0]
      })
    }
  }, [currCategory, posts, categories])


  const [t, i18n] = useTranslation()
  const translatedCat = useMemo(() => categories.map(c => {
    if (c[0] === "All Posts") {
      return [t("allposts"), c[1]] as [string, number]
    } else {
      return c
    }
  }), [categories, t])

  return (
    <div>
      <Head>
        <title>{`${siteInfo.author} - Blog`}</title>
        <CommonHead />
      </Head>
      <LayoutContainer>
        <OneColLayout>
          <NavCat items={translatedCat} current={currCategory} setCurrent={setCurrCategory} />
          <PostGrids>
            {filteredPosts.map((post, i) => {
              return (<ArticleItem key={post.id} p={post} i={i} />)
            })}
            {/* {transition((style, p, _, i) => {
                  return <ArticleItem p={p} springStyle={style} key={p.id} index={i}/>
                })} */}
          </PostGrids>
        </OneColLayout>
      </LayoutContainer>

    </div>
  )
}

function ArticleItem({ p, i }: {
  p: PostType,
  i: number
}) {
  return (
    <Card href={'/posts/' + p.id} $num={i + 1} passHref={true}>
      <CardContent $num={i + 1}>
        <div className='meta'>
          <span className='date'>{dateI18n(parseDate(p.date))}</span>
          <Folder size="1em" style={{ marginLeft: "0.5em", marginRight: "0.25em", marginBottom: "0.125rem" }} />
          <span className="category">
            {p.categories}
          </span>
        </div>
        <div className="post-container"><span className='title'>{p.title}</span>
          <div className="meta description">
            {p.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  buildIndex(POST_DIR, require("path").join(process.cwd(), 'public', 'data', 'posts'))
  return {
    props: {
      posts: posts_db.metas,
      categories: Array.from(posts_db.categories())
    }
  }
}

export default Home

const PostGrids = styled.section`
  display: grid;
  justify-content: center;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 4rem;
  animation: ${bottomFadeIn} 0.5s ease;

  @media screen and (max-width: 780px) {
    grid-template-columns: repeat(1, 100%);
  }
`

const Card = styled(Link) <{
  $num: number
}>`
  display: block;
  min-height: 6rem;
  cursor: pointer;
  animation-fill-mode: forwards;
  position: relative;
  /*border-bottom: dotted 2px ${p => p.theme.colors.uiLineGray};*/

/*  
  &::before {
    content: "No.${p => p.$num.toString(10)}";
    position: absolute;
    right: 0;
    bottom: 1rem;
    font-style: italic;
    font-size: 1.125rem;
    font-variant-numeric: tabular-nums;
    font-weight: bold;
    color: ${props => props.theme.colors.uiLineGray3};
  }
    */

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    transition: box-shadow .5s;
    }

  .post-container{
    transform: translateX(0);
    transition: transform .5s;
  }

  .post-container::before {
    content: '';
    position: absolute;
    left: 0px;
    width: 0px;
    height: 2.25rem;
    background: ${props => props.theme.colors.textPrimary};
    transform: translateX(0px);
    transition: transform .5s ease, width 0.1s linear;
    border-radius: 3px;
  }

   @media (any-hover: hover) {
    &:hover{
      .post-container {
        transform: translateX(16px);
      }
      .post-container::before {
        width: 6px;
        transform: translateX(-16px);
        transition: transform .5s ease, width 0.1s linear .2s;
      }
      .title{
        ${hoverBoxShadow}
      }
    }
  }
  


  @media screen and (max-width: 780px){
    .title{
      font-size: 1.25rem;
    }
    min-height: 5.25rem;
  }

`

const CardContent = styled.div<{
  $num: number
}>`

  padding: 1rem 0 2.5rem 0;
  position: relative;

    
  .meta {
    margin: 0.5rem 0;
    color: ${p => p.theme.colors.textGray2};
  }

  .description {
    color: ${p => p.theme.colors.textSecondary};
  }

  .date {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .category {
    font-weight: 500;
    font-size: 0.875rem;
    display: inline-block;
  }

`

const Decoration = styled.div`
  position: fixed;
  bottom: 5px;
  left:0;
  color: ${props => props.theme.colors.accent};
  width: 100%;
  text-align: right;
  font-size: 0.875rem;
  padding-right: 1.5rem;
`