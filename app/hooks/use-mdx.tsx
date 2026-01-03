import { useEffect, useState } from "react";
import { MDXContent } from "~/components/markdown/MDXComponent";


/**
 * 此组件主要是给没有缓存的一个 State 缓存以免随着父组件重新渲染而重新解析 MDX
 */
export const useMdx = (code: string, components?: Parameters<typeof MDXContent>[0]["components"]) => {
  const [mdxContent, setMdxContent] = useState<React.ReactNode>(null);
  useEffect(() => {
    setMdxContent(<MDXContent code={code} components={components} />);
  }, [code]);
  return mdxContent;
}
