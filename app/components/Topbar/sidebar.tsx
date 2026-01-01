import { Github, Mail, Rss } from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router";
import { useTheme, type ThemeMode } from "~/hooks/use-theme";
import { siteInfo } from "../../../site.config";
import MenuIcon from "./menuicon";

type Props = {
  isShow: boolean,
  toggle: () => void
}

export default function Sidebar({ isShow, toggle }: Props) {
  const { theme, setTheme } = useTheme()

  function handleThemeChange() {
    const targetTheme: ThemeMode =
      theme === 'system' ? 'dark'
        : theme === 'dark' ? 'light'
          : 'system';
    setTheme(targetTheme)
  }

  const themeText = useMemo(() => {
    return theme === 'system' ? '系统外观' :
      theme === 'dark' ? '夜间模式'
        : '日间模式'
  }, [theme])

  // 基础的过渡样式，用于列表项的交错动画
  // 核心逻辑：isShow ? "正常位置 + 可见" : "向下偏移 + 透明"
  const getItemTransition = (delayClass: string) => `
    transition-all duration-1000 ease-out transform
    ${delayClass}
    ${isShow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
  `;

  return (
    <section
      className={`
        fixed inset-0 z-9 w-full h-full overflow-auto
        bg-bg/90 backdrop-blur-[6px]
        transition-all duration-500 ease-[cubic-bezier(0.46,0,0.08,1.11)]
        ${isShow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <div className="mx-auto pt-32 pb-23 text-center font-bold relative">

        {/* Title */}
        <h1 className={`${getItemTransition('delay-0')}`}>
          <span className="relative inline-block">
            {"SANSUI'S BLOG"}
            {/* Underline Effect */}
            <span className="absolute left-0 bottom-0 w-full h-[0.5em] rounded-[0.5em] bg-accent-hover mix-blend-overlay -z-10" />
          </span>
        </h1>

        {/* Theme Toggle */}
        <div
          className={`mt-8 ${getItemTransition('delay-100')}`}
          onClick={handleThemeChange}
        >
          <OptionText>{themeText}</OptionText>
        </div>

        {/* Categories */}
        <div className={`mt-4 ${getItemTransition('delay-200')}`}>
          <OptionText>
            <Link to="/categories">分类标签</Link>
          </OptionText>
        </div>

        {/* RSS */}
        <div className={`mt-4 ${getItemTransition('delay-300')}`}>
          <OptionText>
            <a href="/atom.xml">RSS</a>
          </OptionText>
        </div>

        {/* Footer Info */}
        <div className={`pt-12 text-[10px] font-normal ${getItemTransition('delay-400')}`}>
          <div className="my-4 flex justify-center items-center">
            {/* Icons */}
            <SocialIcon href={siteInfo.social.github}><Github /></SocialIcon>
            <SocialIcon href={`mailto:${siteInfo.social.email}`}><Mail /></SocialIcon>
            <SocialIcon href="/rss"><Rss /></SocialIcon>
          </div>
          <div className="mx-auto my-4 leading-relaxed">
            Sansui 2025<br />All rights reserved
          </div>
        </div>

      </div>

      {/* Close Button */}
      <div className="fixed top-5.5 right-5 w-6 h-5 z-50">
        <MenuIcon isClose={true} isCloseToggler={toggle} />
      </div>
    </section>
  )
}

// --- 子组件提取 ---

const OptionText = ({ children }: { children: React.ReactNode }) => (
  <span className="
    text-[1.625rem] leading-11 relative inline-block
    cursor-pointer transition-transform duration-300 ease-out
    hover:text-accent-hover hover:scale-110
  ">
    {children}
  </span>
)

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a
    href={href}
    className="mx-1 text-text-primary hover:text-accent-hover transition-colors [&>svg]:w-6 [&>svg]:h-6"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
)
