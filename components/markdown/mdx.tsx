import { runSync } from '@mdx-js/mdx'
import { Fragment, useMemo } from 'react'
import * as prod from 'react/jsx-runtime'
import { MDImg } from "./md-img"
import { MemoTag } from './md-tag'

/**
 * @param code function string
 * see https://mdxjs.com/packages/mdx/#runoptions
 * see https://mdxjs.com/packages/mdx/#runcode-options
 */
function convertBack(code: string) {
  const runOptions = {
    Fragment: Fragment,
    ...prod,
    baseUrl: import.meta.url
  }

  const mdxModule = runSync(code, runOptions) // support ssg, but there is an impact on fcp when ISR/SSR
  return mdxModule
}

export function useMdxPost(code: string) {
  const mdxModule = useMemo(() => convertBack(code), [code])
  const components = useMemo(() => ({
    img: MDImg
  }), [])

  return <mdxModule.default components={components} />
}

export function useMdxMemo(code: string, handleClickTag: (tag: string) => void) {
  const mdxModule = useMemo(() => convertBack(code), [code])
  const components = useMemo(() => ({
    Tag: MemoTag(handleClickTag)
  }), [handleClickTag])

  return <mdxModule.default components={components} />
}