import { Github, Mail, Rss } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { siteInfo } from "site.config";
import { useTheme, type ThemeMode } from "~/hooks/use-theme";
import MenuIcon from "./menuicon";

type Props = {
  isShow: boolean;
  toggle: () => void;
};

export default function Sidebar({ isShow, toggle }: Props) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  function handleThemeChange() {
    const targetTheme: ThemeMode =
      theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(targetTheme);
  }

  const themeText = useMemo(() => {
    return theme === "system"
      ? t("ui.themeSystem")
      : theme === "dark"
        ? t("ui.themeDark")
        : t("ui.themeLight");
  }, [theme, t]);

  // 基础的过渡样式，用于列表项的交错动画
  // 核心逻辑：isShow ? "正常位置 + 可见" : "向下偏移 + 透明"
  const getItemTransition = (delayClass: string) => `
    transition-all duration-1000 ease-out transform
    ${delayClass}
    ${isShow ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}
  `;

  return (
    <section
      className={`bg-bg/90 fixed inset-0 z-9 h-full w-full overflow-auto backdrop-blur-[6px] transition-all duration-500 ease-[cubic-bezier(0.46,0,0.08,1.11)] ${isShow ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} `}
    >
      <div className="relative mx-auto pt-32 pb-23 text-center font-bold">
        {/* Title */}
        <h1 className={`${getItemTransition("delay-0")}`}>
          <span className="relative inline-block">
            {t("ui.blogTitle", { author: siteInfo.author.toUpperCase() })}
            {/* Underline Effect */}
            <span className="bg-accent-hover absolute bottom-0 left-0 -z-10 h-[0.5em] w-full rounded-[0.5em] mix-blend-overlay" />
          </span>
        </h1>

        {/* Theme Toggle */}
        <div
          className={`mt-8 ${getItemTransition("delay-100")}`}
          onClick={handleThemeChange}
        >
          <OptionText>{themeText}</OptionText>
        </div>

        {/* Categories */}
        <div className={`mt-4 ${getItemTransition("delay-200")}`}>
          <OptionText>
            <Link to="/categories">{t("ui.categoriesTags")}</Link>
          </OptionText>
        </div>

        {/* RSS */}
        <div className={`mt-4 ${getItemTransition("delay-300")}`}>
          <OptionText>
            <a href="/atom.xml">{t("ui.rss")}</a>
          </OptionText>
        </div>

        {/* Footer Info */}
        <div
          className={`pt-12 text-[10px] font-normal ${getItemTransition("delay-400")}`}
        >
          <div className="my-4 flex items-center justify-center">
            {/* Icons */}
            <SocialIcon href={siteInfo.social.github}>
              <Github />
            </SocialIcon>
            <SocialIcon href={`mailto:${siteInfo.social.email}`}>
              <Mail />
            </SocialIcon>
            <SocialIcon href="/rss">
              <Rss />
            </SocialIcon>
          </div>
          <div className="mx-auto my-4 leading-relaxed">
            {t("ui.copyright", { author: siteInfo.author, year: new Date().getFullYear() })}
            <br />
            {t("ui.allRightsReserved")}
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="fixed top-5.5 right-5 z-50 h-5 w-6">
        <MenuIcon isClose={true} isCloseToggler={toggle} />
      </div>
    </section>
  );
}

// --- 子组件提取 ---

const OptionText = ({ children }: { children: React.ReactNode }) => (
  <span className="hover:text-accent-hover relative inline-block cursor-pointer text-[1.625rem] leading-11 transition-transform duration-300 ease-out hover:scale-110">
    {children}
  </span>
);

const SocialIcon = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-text-primary hover:text-accent-hover mx-1 transition-colors [&>svg]:h-6 [&>svg]:w-6"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);
