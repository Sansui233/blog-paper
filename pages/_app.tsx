import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { DefaultTheme, ThemeProvider } from 'styled-components'
import useAppState from '../lib/app-states'
import * as gtag from '../lib/gtag'
import detectBrowserLang from '../locales/detect'
import '../locales/i18n'
import { siteInfo } from '../site.config'
import { genSystemTheme, lightTheme, themeMap } from '../styles/colors'
import { GlobalStyle } from '../styles/global'
import '../styles/global.css'

function MyApp({ Component, pageProps }: AppProps) {

  const { language, setLanguage, ...appState } = useAppState() // 解构赋值以防止改 theme 时刷新 lang
  const [themeObj, setThemeObj] = useState<DefaultTheme>({ ...lightTheme, mode: "system" })
  const router = useRouter()

  // init language
  useEffect(() => {
    const lang = detectBrowserLang().slice(0, 2)
    setLanguage(lang) // 由于大部分内容 SSR，英文 ui 会有闪屏……
  }, [setLanguage])

  // Google Analystics
  useEffect(() => {
    if ((!("GAId" in siteInfo)) || siteInfo.GAId === "") {
      return
    }
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // subscribe theme changed from User
  useEffect(() => {
    if (themeObj.mode !== appState.theme) {
      setThemeObj(themeMap(appState.theme))
    }
  }, [appState, themeObj.mode])

  // init global theme context after cookie available
  useEffect(() => {
    const cookieTheme = appState.getCookieTheme()
    setThemeObj(themeMap(cookieTheme))
    appState.setTheme(cookieTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // subscribe theme change from OS
  useEffect(() => {
    const themeChangeHandler = () => {
      if (appState.theme === 'system') {
        setThemeObj(genSystemTheme())
      }
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', themeChangeHandler)

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', themeChangeHandler)
    }
  }, [appState])

  return <>
    {/* Global Site Tag (gtag.js) - Google Analytics */}
    <ThemeProvider theme={themeObj}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
    />
    <Script
      id="gtag-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
      }}
    />
  </>
}

export default MyApp
