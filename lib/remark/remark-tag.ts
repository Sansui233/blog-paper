import { findAndReplace } from "mdast-util-find-and-replace";

// 将 #标签 替换为 <Tag text={"标签"} /> ，以解决与react hook的交互问题和事件绑定问题
export function remarkTag() {
  return (tree: Parameters<typeof findAndReplace>[0]) => {
    findAndReplace(tree, [
      [
        // (?<=^|\s) 确保只匹配行首或空格后的 #
        // ([\p{L}\p{N}_]+) 匹配 Unicode 字母、数字、下划线
        /(?<=^|\s)#([\p{L}\p{N}_-]+)/gu,
        (match, tag) => {
          return {
            type: "mdxJsxTextElement",
            name: "Tag",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "text",
                value: tag,
              },
            ],
            children: [{ type: "text", value: match }],
          };
        },
      ],
    ]);
  };
}

// todo: test cases
function flatsplit(
  input: string,
  delimiters: string[],
): Array<{ text: string; isDelimiter: boolean }> {
  // boundary
  if (delimiters.includes(input)) {
    return [{ text: input, isDelimiter: true }];
  }

  let res: {
    text: string;
    isDelimiter: boolean;
  }[] = [{ text: input, isDelimiter: false }];

  // split by delimiters
  for (const d of delimiters) {
    let temp: {
      text: string;
      isDelimiter: boolean;
    }[] = [];

    for (const part of res) {
      if (part.isDelimiter) {
        temp.push(part);
        continue;
      }

      if (part.text === "") {
        continue;
      }

      const splitParts = part.text.split(d);
      for (let i = 0; i < splitParts.length; i++) {
        temp.push({
          text: splitParts[i],
          isDelimiter: false,
        });

        // ending boundary
        if (i === splitParts.length - 1) {
          break;
        } else {
          temp.push({
            text: d,
            isDelimiter: true,
          });
        }
      }
    }
    res = temp;
  }
  return res.filter((r) => r.text !== "");
}

//const s = [
// "#tag1 asdlfasf",
// "#tag1 a9sdf #tag2 #tag3 asd#nottag #tag4",
// "a9sdf #tag1 #tag2 #tag3# `asdf#nottag`haha#tag #tag4"
// ]
//console.log(s.map( v => extractTags(v)))
