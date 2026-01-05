import { Github, Mail, Rss } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { siteInfo } from 'site.config'

type Props = React.HTMLProps<HTMLDivElement>

const Footer = ({ className, ...props }: Props) => {
  const { t } = useTranslation()

  // 提取公共样式让 JSX 更整洁
  // inline-block 确保 transform/margin 生效
  // mx-2 对应原 CSS 的 margin: 0 0.5rem
  const linkClass = "inline-block mx-2 hover:text-accent-hover transition-colors duration-200"

  // 对应原 CSS svg { font-size: 1.5rem } -> 24px
  const iconClass = "w-6 h-6"

  return (
    <footer
      // pt-6(24px) pb-2.5(10px) text-[10px](0.625rem)
      className={`pt-6 pb-2.5 text-center text-[10px] text-text-secondary ${className || ''}`}
      {...props}
    >
      {/* Social Icons */}
      <nav>
        <a
          href={siteInfo.social.github}
          className={linkClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Github"
        >
          <Github className={iconClass} />
        </a>

        <a
          href={`mailto:${siteInfo.social.email}`}
          className={linkClass}
          aria-label="Email"
        >
          <Mail className={iconClass} />
        </a>

        <a
          href="/rss"
          className={linkClass}
          aria-label="RSS"
        >
          <Rss className={iconClass} />
        </a>
      </nav>

      {/* Copyright Text */}
      {/* my-6(1.5rem) tracking-[0.2px] */}
      <div className="my-6 mx-auto tracking-[0.2px]">
        {t("ui.copyright", { author: siteInfo.author, year: new Date().getFullYear() })} <br /> {t("ui.allRightsReserved")}
      </div>
    </footer>
  )
}

export default Footer
