import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import { CommonHead } from "..";
import LayoutContainer from "../../components/layout";
import { CategoryLayoutStyle, CategoryTitle } from "../../components/post/timeline";
import { posts_db } from "../../lib/data/server";
import { siteInfo } from "../../site.config";

export default function Categories({ categories, tags }: {
  categories: {
    [k: string]: number;
  },
  tags: {
    [k: string]: number;
  }
}) {
  return <>
    <Head>
      <title>{`${siteInfo.author}'s Blog - Categories`}</title>
      <CommonHead />
    </Head>
    <LayoutContainer>
      <CategoryLayoutStyle>
        <CategoryTitle>
          <span>CATEGORIES</span>
          <h1>分类</h1>
        </CategoryTitle>
        <Container>
          {Object.keys(categories).map(k => {
            return (
              <Link href={`/categories/${k}`} passHref={true} key={k} legacyBehavior>
                <LabelStyle>{`${k}(${categories[k]})`}</LabelStyle>
              </Link>
            );
          })}
        </Container>
        <CategoryTitle>
          <span>TAGS</span>
          <h1>标签</h1>
        </CategoryTitle>
        <Container>
          {Object.keys(tags).map(k => {
            if (tags[k] === 0) return
            return (
              <Link href={`/tags/${k}`} passHref={true} key={k} legacyBehavior>
                <LabelStyle>{`${k}(${tags[k]})`}</LabelStyle>
              </Link>
            );
          })}
        </Container>
      </CategoryLayoutStyle>
    </LayoutContainer>
  </>;
}

export const getStaticProps: GetStaticProps = () => {
  return {
    props: {
      categories: Object.fromEntries(posts_db.categories()),
      tags: Object.fromEntries(posts_db.tags())
    }
  }
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content:flex-start;
`

const LabelStyle = styled.a`
  opacity: .8;
  margin: .3em;
  background-color:${props => props.theme.colors.tagBg};  
  padding: .3em 1em;
  border-radius: 1em;
  transition: opacity .3s,transform .3s;
  font-size: 0.875rem;
  &:hover {
    opacity: 1;
    transform: scale(1.15);
  }
`

