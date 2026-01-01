import { Element, Node, Root, Text } from "hast";

/**
 * make to string
 */
export function toString(node: Node): string{
  if(node.type === "text") return (node as Text).value
  if(node.type === "element"){
    return (node as Element).children.map(child => toString(child)).join("")
  }
  if(node.type === "root"){
    return (node as Root).children.map(child => toString(child)).join("")
  }
  return ""
}

/**
 * get rank of heading element
 */
export function headingRank(node: Node): number | undefined {
  if(node.type !== "element") return
  const headings = ["h1","h2","h3","h4","h5","h6"]
  if(headings.includes((node as Element).tagName)){
    return Number((node as Element).tagName[1])
  }
}