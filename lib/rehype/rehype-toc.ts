import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { headingRank, toString } from "./hast-util";

/** setting heading id */
export function rehypeHeadingsAddId() {
  return function transformer(tree: Root) {
    visit(tree, "element", function (node) {
      if (headingRank(node)) {
        const text = toString(node);
        const anchorId = text.toLowerCase().replace(/\s+/g, '-');
        node.properties = node.properties || {};
        node.properties.id = anchorId;
      }
    });
  };
};