/**
 * 统计实际展现在 Html 页面上的 Markdown 字符数
 * @param markdown - Markdown original text
 * @return number - actual length of the text
 */
export function mdLength(markdown: string): number {
  let text = markdown;
  text = text.replace(/\\(.)/g, "$1"); // 先处理转义字符

  // 移除 MDX 的 import 和 export 语句
  text = text.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, "");
  text = text.replace(/^export\s+(const|var|let|default)[\s\S]*?;/gm, "");

  // 移除 { ... } 插值
  text = text.replace(/\{[\s\S]*?\}/g, "");

  // 1. 移除注释
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // 2. 移除分割线（考虑行首空格）
  text = text.replace(/^\s*([-*_])\s*\1\s*\1+\s*$/gm, "");

  // 3. 处理代码块（```...```），只保留内容，移除语言标识符
  // text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');
  // 处理代码块，完全移除
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, "");

  // 4. 处理行内代码 `code`
  text = text.replace(/`{1,2}([^`]+?)`{1,2}/g, "$1");

  // 5. 处理图片 ![alt](src)
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, "$1");

  // 6. 处理链接 [text](url)
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // 7. 移除 mdx 组件（支持多行，首字母大写的组件）
  text = text.replace(
    /<([A-Z]\w*)([^>]*)\/>|<([A-Z]\w*)([^>]*)>[\s\S]*?<\/\3>/g,
    "",
  );

  // 8. 处理 HTML 标签（只保留内容）
  text = text.replace(/<[^>]+>(.*?)<\/[^>]+>/gs, "$1");
  // 单标签如 <br/> 直接移除
  text = text.replace(/<[^>]+\/>/g, "");

  // 8.5. 处理任务列表 - [ ] text 或 - [x] text（考虑行首空格）
  text = text.replace(/^\s*[-*+]\s*\[[ xX]\]\s+/gm, "");

  // 9. 处理 MD 内容
  text = text.replace(/^\s*#{1,6}\s+/gm, ""); // 标题
  text = text.replace(/[*_]{1,3}/g, ""); // 加粗倾斜
  text = text.replace(/^\s*>\s+/gm, ""); // 引用
  text = text.replace(/^\s*\d+\.\s+/gm, ""); // 有序列表
  text = text.replace(/^\s*[-*+]\s+/gm, ""); // 无序列表

  // 12. 处理表格 - 正确提取单元格内容
  text = text.replace(/\\\|/g, "\\PIPE\\"); // 先保护转义的竖线
  text = text.replace(/^\s*\|(.+)\|\s*$/gm, (match, content) => {
    if (/^[\s\-:|]+$/.test(content)) return "";
    return content
      .split("|")
      .map((cell: string) => cell.trim())
      .filter((cell: string) => cell.length > 0)
      .join(" ");
  });
  text = text.replace(/\\PIPE\\/g, "|"); // 恢复转义的竖线

  // // 15. 移除多余空白字符
  text = text.replace(/\s+/g, ""); // 移除所有空白（包括换行和中英之间的空格），只留纯字符
  // text = text.replace(/\s+/g, " ").trim(); // 保留单个空格

  console.debug("mdLength processed text:", text);
  return Array.from(text).length; //(处理 Emoji)需展开成数组
}

console.log(mdLength("- [ ] 任务一\n- [x] 任务二"));
