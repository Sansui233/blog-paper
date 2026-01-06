import { useEffect, useState } from "react";
import { siteInfo } from "site.config";
import { OneColLayout } from "~/components/common/layout";
import type { Route } from "./+types/about";
import "./about.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `About ${siteInfo.author}` },
    { name: "description", content: "A personal blog about work and life" },
  ];
}

export default function About() {
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/imgs/bg.jpg";
    img.onload = () => setIsBgLoaded(true);
    img.onerror = () => {};

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <h1 className={`about-hero ${isBgLoaded ? "loaded" : ""}`}>
        <span>{`Hi, I'm ${siteInfo.author}`}</span>
      </h1>

      <OneColLayout>
        {/* Page Description */}
        <div className="text-text-gray-2 text-right text-sm italic">
          / 记录一些思考和吐槽 /
        </div>

        {/* Content */}
        <div className="markdown-wrapper animate-bottom-fade-in">
          <p>
            Github: <a href="https://github.com/sansui233">Sansui233</a>
            <br />
            E-mail：
            <a href={`mailto:${siteInfo.social.email}`}>
              {siteInfo.social.email}
            </a>
          </p>

          <h4>Programing</h4>
          <p>
            计算机专业。杂食。目前以前端为主，喜欢用<del>爱</del>懒发电
          </p>
          <ul>
            <li>后端：Golang, Python</li>
            <li>前端：React, Next.js, React Router 7</li>
          </ul>

          <h4>Design&amp;Painting</h4>
          <del>要被 AI 取代了，还管这些？</del>
          <ul>
            <li>长期 P 图。</li>
            <li>业余画二次元插画类。不太会做角色设计。</li>
          </ul>

          <h4>Projects</h4>
          <p>
            这个博客算一个，其实手搓下来东西挺多的。
            <br />
            其他大多由于各种原因弃坑。比如
          </p>
          <ul>
            <li>
              <a href="https://github.com/Sansui233/fgomerlin">
                FGO素材规划工具
              </a>
              ：是可离线使用的 Web App
              <br />
              弃坑原因：不玩了。攒了大半年，抽卡太非，剧情无聊，立绘质量参差不齐
            </li>
            <li>
              <a href="https://github.com/Sansui233/fgo-airtest">FGO-Airtest</a>
              ：ios
              可用的游戏自动化刷本工具，俗称外挂，但其实是伪物理外挂，挂机模拟手刷。
              <br />
              弃坑原因：不玩了。而且后面安卓和 ios 互通了。
            </li>
            <li>
              <del>一个最好不要放这里的项目</del>
            </li>
          </ul>
          <p>没弃坑的是在自己在用的小东西</p>
          <ul>
            <li>
              <a href="https://github.com/Sansui233/logseq-bonofix-theme">
                Logseq Bonofix Theme
              </a>
              : 一个 Logseq 主题，保持简洁但感觉更轻松。
              <br />
              最开始是因为 Logseq UI
              太丑，明明是笔记工具完全没考虑大纲类的排版需要，拿着tailwind
              就往上套，配色层级也一言难尽，强迫症无法忍受。
              <br />
              现在的话 Logseq
              的设计好多了，不过自己还是喜欢己写的主题的轻松感，少有的双色配色，能够轻松聚焦重点，同时又不会花哨。
            </li>
          </ul>
          <p>小工具狂魔，平时写的自用小工具更多一些，基本是个性化的需求。</p>

          <h4 id="game">Game</h4>
          <ul>
            <li>Minecraft</li>
            <li>塞尔达旷野之息</li>
          </ul>
        </div>
      </OneColLayout>
    </>
  );
}
