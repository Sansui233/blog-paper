import { Root } from "mdast"
import { visit } from "unist-util-visit"

// 将 #标签 替换为 <Tag text={"#标签"} /> ，以解决与react hook的交互问题和事件绑定问题
export function remarkTag() {
  return function (tree: Root) {
    visit(tree, "paragraph", function (node, index, parent) {
      const newChildren: any[] = []
      node.children.forEach(child => {
        if (child.type === "text") {

          const text = child.value
          const tags = extractTags(text)
          const delimiters = tags

          if (tags.length > 0) {
            const parts = flatsplit(text, delimiters)

            const endingTag = "#" + tags[tags.length - 1]
            const endingText = parts[parts.length - 1].text
            if (endingText.endsWith(endingTag)) {
              parts[parts.length - 1] = {
                text: endingText.slice(0, endingText.length - endingTag.length),
                isDelimiter: false
              }
              parts.push({
                text: endingTag,
                isDelimiter: true
              })
            }

            parts.forEach(part => {
              // reconstuct hast
              if (part.isDelimiter) {

                const newNode = {
                  type: 'mdxJsxFlowElement',
                  name: "Tag",
                  attributes: [{
                    type: 'mdxJsxAttribute',
                    name: 'text',
                    value: part.text.slice(1) // ignore "#"
                  }]
                };

                newChildren.push(newNode); // push tag node

              } else {
                newChildren.push({ type: "text", value: part.text }) // push text node
              }
            })
          } else {
            newChildren.push(child) // not tag detected
          }
        } else {
          newChildren.push(child) // push none-text
        }
      })

      node.children = newChildren

    })
  }
}

// todo: test cases
function flatsplit(input: string, delimiters: string[]): Array<{ text: string, isDelimiter: boolean }> {
  // boundary
  if (delimiters.includes(input)) {
    return [{ text: input, isDelimiter: true }]
  }

  let res: {
    text: string,
    isDelimiter: boolean
  }[] = [{ text: input, isDelimiter: false }]

  // split by delimiters
  for (const d of delimiters) {

    let temp: {
      text: string,
      isDelimiter: boolean
    }[] = []


    for (const part of res) {

      if (part.isDelimiter) {
        temp.push(part)
        continue
      }

      if (part.text === "") {
        continue
      }

      const splitParts = part.text.split(d)
      for (let i = 0; i < splitParts.length; i++) {
        temp.push({
          text: splitParts[i],
          isDelimiter: false
        });

        // ending boundary
        if (i === splitParts.length - 1) {
          break
        } else {
          temp.push({
            text: d,
            isDelimiter: true
          });
        }
      }
    }
    res = temp
  }
  return res.filter(r => r.text !== "")
}

// todo: test case
// markdown 无换行符
// return "[#tag1,#tag2]"
function extractTags(markdown: string) {
  const title = ["#", "##", "###", "####", "#####", "######"]
  const tags: string[] = [];
  let tmp = ""
  let ignore = false

  for (let i = 0; i < markdown.length; i++) {
    const v = markdown[i];

    // ignore in code
    if (v === "`") {
      ignore = !ignore
      if (ignore) tmp = ``
    }

    if (!ignore) {
      if (tmp.length > 0) { // when in tag
        if (v === " " || v === "\n" || v === "\r\n") {
          // commit tag start with "#" but ignore single "#" and title "##"
          if (!title.includes(tmp)) {
            tags.push(tmp)
          }
          tmp = ""
        } else {
          tmp += v
        }
      } else if (v === "#" && (i === 0 || markdown[i - 1] === " " || markdown[i - 1] === "\n")) { // detect tag start
        tmp += v
      }
    }
  }

  if (tmp.length > 0) tags.push(tmp)

  return tags;
}
//const s = [
// "#tag1 asdlfasf",
// "#tag1 a9sdf #tag2 #tag3 asd#nottag #tag4",
// "a9sdf #tag1 #tag2 #tag3# `asdf#nottag`haha#tag #tag4"
// ]
//console.log(s.map( v => extractTags(v)))
