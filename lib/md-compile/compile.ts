import type { CompileOptions } from "@mdx-js/mdx";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as prod from 'react/jsx-runtime';


let compile: undefined | typeof import("@mdx-js/mdx").compile = undefined;
let runSync: undefined | typeof import("@mdx-js/mdx").runSync = undefined;

const initImport = async () => {
  if (!compile) {
    compile = await (import("@mdx-js/mdx")).then(m => m.compile)
    runSync = await (import("@mdx-js/mdx")).then(m => m.runSync)
  }
}

export async function toMdxCode(src: string, options?: Partial<CompileOptions>) {
  if (!compile) {
    await initImport()
  }
  try {
    const code = String(await compile!(src, {
      outputFormat: 'function-body',
      ...options,
    }))
    return {
      code,
    }
  } catch (error) {
    console.error("%% [mdx.ts]error occured when compiling:", error)
    return {
      code: "compile error",
    }
  }
}

export async function toHTML(src: string, options?: Partial<CompileOptions>, type: "md" | "mdx" = "md") {
  if (!compile) {
    await initImport()
  }

  try {
    if (type === "md") {
      const code = String(await compile!(src, {
        outputFormat: 'function-body',
      }))

      return renderToStaticMarkup(
        React.createElement(runSync!(
          code,
          {
            ...prod
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