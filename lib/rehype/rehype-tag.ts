import type { Element, ElementContent, Root } from "hast"
import { visit } from "unist-util-visit"

// Deprecated. Use remarkTag and corresponding JSX components instead.
export const rehypeTag = () => {
  return (tree: Root) => {
    visit(tree, "element", function (node) {
      // see HTML Element in https://github.com/syntax-tree/hast#nodes
      // console.log(node)
      if (node.tagName === "h1") {
        node.tagName = "p" // 替换 h1 为 p 标签，等于禁用 h1
      }

      if (node.tagName === "p") {
        const newChildren: ElementContent[] = []

        node.children.forEach(child => {
          if (child.type === "text") {
            const text = child.value;
            if (text && text.match(/#([^# ]+) /)) { // 找标签。标签为以#开头以空格结尾的且不是两个连续 ## 的部分
              const parts = text.split(/#([^# ]+) /);

              for (let i = 0; i < parts.length; i++) { // 重构 DOM
                if (i % 2 === 0) { // 偶数为非标签内容
                  newChildren.push({ type: 'text', value: parts[i] });
                } else {
                  const spanNode: Element = {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: 'tag' },
                    children: [{ type: 'text', value: `#${parts[i]} ` }],
                  };
                  newChildren.push(spanNode);
                }
              }
            } else {

              newChildren.push(child)
            }

          } else {
            newChildren.push(child)
          }
        });

        node.children = newChildren

      }

    })
  }
}