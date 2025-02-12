import Head from "next/head";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { CommonHead } from ".";
import { PageDescription } from '../components/common/page-description';
import LayoutContainer, { OneColLayout } from "../components/layout";
import { MarkdownStyle } from "../components/styled/markdown-style";
import { siteInfo } from "../site.config";
import { bottomFadeIn, textFocusIn } from "../styles/animations";
import { textStroke } from "../styles/css";

export default function About() {
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/imgs/bg.jpg';
    img.onload = () => setIsBgLoaded(true);
    img.onerror = () => {
      console.error('Failed to load image');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    }
  }, [])

  return (
    <div>
      <Head>
        <title>{`About ${siteInfo.author}`}</title>
        <CommonHead />
      </Head>
      <LayoutContainer hidesearch={true}>
        <Hero className={isBgLoaded ? 'loaded' : ''}>
          <div className="background"></div>
          <span>{`Hi, I'm ${siteInfo.author}`}</span>
        </Hero>
        <OneColLayout>
          <AboutDescription>/ 记录一些思考和吐槽 /</AboutDescription>
          <AnimatedMarkdown>
            <p>Github: <a href="https://github.com/sansui233">Sansui233</a><br />
              E-mail：<a href="mailto:sansuilnm@gmail.com">sansuilnm@gmail.com</a></p>
            <h4>Programing</h4>
            <p>计算机专业。杂食。目前以前端为主，喜欢用<del>爱</del>懒发电</p>
            <ul>
              <li>后端：Java, C++, Golang, Python</li>
              <li>前端：React, Next.js</li>
            </ul>
            <h4>Design&amp;Painting</h4>
            <p>长期做海报。</p>
            <p>业余画二次元插画类。不太会做角色设计。</p>
            <h4>Projects</h4>
            <p>这个博客算一个。其他大多由于各种原因弃坑。比如</p>
            <ul>
              <li><a href="https://github.com/Sansui233/fgomerlin">FGO素材规划工具</a>：是可离线使用的 Web App<br />
                弃坑原因：不玩了。攒了大半年，抽卡太非，剧情无聊，立绘质量参差不齐</li>
              <li><a href="https://github.com/Sansui233/fgo-airtest">FGO-Airtest</a>：ios 可用的游戏自动化刷本工具，俗称外挂，但其实是伪物理外挂，挂机模拟手刷。<br />
                弃坑原因：不玩了。而且后面安卓和 ios 互通了。</li>
              <li><del>一个最好不要放这里的项目</del></li>
            </ul>
            <p>没弃坑的是在自己在用的小东西</p>
            <ul>
              <li><a href="https://github.com/Sansui233/logseq-bonofix-theme">Logseq Bonofix Theme</a>: 一个 Logseq 题，保持简洁但感觉更轻松。<br />
                最开始是因为 Logseq UI 太丑，明明是笔记工具完全没考虑大纲类的排版需要，拿着tailwind 就往上套，配色层级也一言难尽，强迫症无法忍受。<br />
                现在的话 Logseq 的设计好多了，不过自己还是喜欢己写的主题的轻松感，少有的双色配色，能够轻松聚焦重点，同时又不会花哨。</li>
            </ul>
            <p>小工具狂魔，平时写的自用小工具更多一些，基本是个性化的需求。</p>
            <h4><a href="#game"></a>Game</h4>
            <ul>
              <li>Minecraft</li>
              <li>塞尔达旷野之息</li>
            </ul>
          </AnimatedMarkdown>
        </OneColLayout>
      </LayoutContainer>
    </div>
  )
}

const Hero = styled.h1`
  span {
    ${() => textStroke}
  }

  position: relative;
  text-align: center;
  margin: 0px 0px 0.5em;
  padding: 15% 0px;
  color: white;

  &.loaded {
    background: #00000022;
  }
  
  div.background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;

    background: linear-gradient(-45deg, #76318f, #283370, #003a4d, #a8a8a8);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
  }

  &.loaded div.background {
    opacity: 1;
    animation: none;
    background: black;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* 图片背景（初始隐藏） */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(/imgs/bg.jpg);
    background-size: cover;
    background-position: center 40%;
    opacity: 0;
    z-index: -1;
  }

  /* 加载完成后的样式 */
  &.loaded::before {
    animation: none;
    opacity: 0;
    transition: opacity 0.5s;
  }

  &.loaded::after {
    opacity: 1;
    animation: ${textFocusIn} 0.8s ease-out;
  }
`

const AnimatedMarkdown = styled(MarkdownStyle)`
  animation: ${bottomFadeIn} .3s ease;
`

const AboutDescription = styled(PageDescription)`
`