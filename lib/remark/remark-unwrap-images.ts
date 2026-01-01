import type { Link, LinkReference, Paragraph, Root } from "mdast"
import { SKIP, visit } from "unist-util-visit"


//https://github.com/remarkjs/remark-unwrap-image

enum Status {
  Unknown,
  isImgOnly,
  Other,
}

export function remarkUnrwrapImages() {
  return function (tree: Root) {
    visit(tree, 'paragraph', function (node, index, parent) {
      if (
        parent && index &&
        isImageParagraph(node, false) === Status.isImgOnly
      ) {
        parent.children.splice(index, 1, ...node.children)
        return [SKIP, index]
      }
    })
  }
}

function isImageParagraph(node: Paragraph | Link | LinkReference, inLink: boolean): Status {
  let status = Status.Unknown

  let index = -1
  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'text' && whitespace(child.value)) {
      // Whitespace is fine.
    } else if (child.type === 'image' || child.type === 'imageReference') {
      status = Status.isImgOnly
    } else if (
      !inLink &&
      (child.type === 'link' || child.type === 'linkReference')
    ) {
      const linkResult = isImageParagraph(child, true)
      if (linkResult === Status.Other) {
        return Status.Other
      }
      if (linkResult === Status.isImgOnly) {
        status = Status.isImgOnly
      }
    } else {
      return Status.Other
    }
  }
  return status
}

const re = /[ \t\n\f\r]/g
function whitespace(text: string) {
  return text.replace(re, '') === ''
}