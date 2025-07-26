import { css, DefaultTheme } from "styled-components"
import { ThemeMsg } from "../lib/app-states"

export const lightTheme: DefaultTheme = {
  mode: 'light',
  assets: {
    favico: '/avatar-white.png',
  },
  colors: {
    textPrimary: '#000000',
    textSecondary: '#343a3b',
    textGray: '#777',
    textGray2: '#989898',
    textGray3: '#aeaeae',
    accent: '#ae8d0b',
    accentHover: '#e0c56e',
    bg: 'white',
    bg2: '#f9f9f9',
    bgFilter: "multiply",
    bgInverse: "#292929",
    bgMask: "#f4f5f7f4",
    tagBg: "#efefef",
    floatBg: "#f5f5f5",
    hoverBg: '#00000012',
    shadowBg: `rgb(0 0 0 / 4%)`,
    codeBlockBg: '#f3f3f3',
    maskGradient: css`
    background-image: -webkit-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: -moz-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: -o-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    `,
    navBgGradient: css`
    background: -webkit-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: -moz-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: -o-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    `,
    uiLineGray: "#a2a2a280",
    uiLineGray2: "#a2a2a260",
    uiLineGray3: "#a2a2a243",

  }
}
export const darkTheme: DefaultTheme = {
  mode: 'dark',
  assets: {
    favico: '/avatar-black.png',
  },
  colors: {
    textPrimary: '#f8f8f8',
    textSecondary: '#dfdfdf',
    textGray: '#bababa',
    textGray2: '#8e8e8e',
    textGray3: '#6a6a6a',
    accent: '#c4a747',
    accentHover: '#ae8d0b',
    bg: '#242424',
    bg2: '#1e1e1e',
    bgMask: "#242424f4",
    bgFilter: "screen",
    bgInverse: '#f8f8f8',
    tagBg: "#353535",
    floatBg: "#303030",
    hoverBg: '#ffffff55',
    shadowBg: `rgb(255 255 255 / 5%)`,
    codeBlockBg: '#3b3b3b',
    maskGradient: css`
    background-image: -webkit-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: -moz-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: -o-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    `,
    navBgGradient: css`
    background: -webkit-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: -moz-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: -o-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    `,
    filterDarker: css`filter: brightness(0.8);`,
    uiLineGray: "#a2a2a280",
    uiLineGray2: "#a2a2a25a",
    uiLineGray3: "#a2a2a233",
  }
}

export const genSystemTheme = ((): DefaultTheme => {
  if (typeof window === "undefined") {
    console.warn("serverside window not available, set to light");
    return lightTheme // fallback
  } else {
    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme
    return {
      ...theme,
      mode: 'system'
    }
  }
})

export function themeMap(themeMsg: ThemeMsg) {
  switch (themeMsg) {
    case "light":
      return lightTheme
    case "dark":
      return darkTheme
    default:
      return genSystemTheme()
  }
}
