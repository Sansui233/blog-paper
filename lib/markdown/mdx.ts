import React, { Fragment } from 'react'
import { renderToStaticMarkup } from "react-dom/server"
import * as prod from 'react/jsx-runtime'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeExtractHeadings, rehypeHeadingsAddId } from '../rehype/rehype-toc'
import { remarkTag } from '../remark/remark-tag'
import { remarkUnrwrapImages } from '../remark/remark-unwrap-images'

let compile: undefined | typeof import("@mdx-js/mdx").compile = undefined;
let runSync: undefined | typeof import("@mdx-js/mdx").runSync = undefined;

// code-splitting
// 规避 top-level await 带来的问题
// 规避多次 import 带来的蜜汁卡死……
// 但是会导致后面要对 compile 做类型断言
const initImport = async () => {
  if (!compile) {
    compile = await (import("@mdx-js/mdx")).then(m => m.compile)
    runSync = await (import("@mdx-js/mdx")).then(m => m.runSync)
  }
}


// returns mdx function string
export async function compileMdxPost(src: string) {
  let headings: { title: string; rank: number; id: string; }[] = []
  // normalize heading rank
  function normalizeHeading(headings: {
    title: string;
    rank: number;
    id: string;
  }[]) {
    if (headings.length > 0) {
      const minRank = Math.min(...headings.map(heading => heading.rank));
      const offset = minRank - 1;
      return headings.map(heading => ({
        ...heading,
        rank: heading.rank - offset
      }));
    } else {
      return headings
    }
  }

  if (!compile) {
    await initImport()
  }

  try {
    const code = String(await compile!(src, {
      outputFormat: 'function-body',
      remarkPlugins: [
        remarkGfm,
        remarkUnrwrapImages
      ],
      rehypePlugins: [
        rehypeHeadingsAddId,
        [rehypeExtractHeadings, { rank: [1, 2, 3], headings }],
        rehypeHighlight,
      ]
    }))


    return {
      code,
      headings: normalizeHeading(headings)
    }
  } catch (error) {
    console.error("%% [mdx.ts ]error occured when compiling:", error)
    return {
      code: "compile error",
      headings: normalizeHeading(headings)
    }
  }
}



export async function compileMdxMemo(src: string) {
  if (!compile) {
    await initImport()
  }
  try {

    const code = String(await compile!(src, {
      outputFormat: 'function-body',
      remarkPlugins: [
        remarkGfm,
        remarkTag,
      ],
      rehypePlugins: [
        rehypeHighlight,
      ]
    }))

    return { code }
  } catch (error) {
    console.error("%% [mdx.ts ]error occured when compiling:", error)
    return { code: "compile error" }
  }
}

/**
 * return html string
 */
export async function compileMdxRss(src: string, type: "md" | "mdx") {
  if (!compile) {
    await initImport()
  }

  try {
    if (type === "md") {
      const code = String(await compile!(src, {
        outputFormat: 'function-body',
        remarkPlugins: [
          remarkGfm
        ],
        rehypePlugins: [
          rehypeHighlight,
          rehypeTag,
        ]
      }))

      return renderToStaticMarkup(
        React.createElement(runSync!(
          code,
          {
            Fragment: Fragment,
            ...prod,
            baseUrl: import.meta.url
          }
        ).default)
      )

    } else {
      return "This article is written in mdx format, which is not compatible with rss. Please visit the original site."
    }
  }
  catch (error) {
    console.error("%% [mdx.ts ]error occured when compiling:", error)
    return "compile error"
  }
}

