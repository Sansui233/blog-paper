/**
* 统计实际展现在 Html 页面上的 Markdown 字符数
* @param markdown - Markdown original text
* @return number - actual length of the text
*/
export function mdLength(markdown: string): number {
  let text = markdown;

  // 1. 移除注释
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 2. 移除分割线（考虑行首空格）
  text = text.replace(/^\s*([-*_])\s*\1\s*\1+\s*$/gm, '');

  // 3. 处理代码块（```...```），只保留内容，移除语言标识符
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');

  // 4. 处理行内代码 `code`
  text = text.replace(/`([^`]+?)`/g, '$1');

  // 5. 处理图片 ![alt](src)
  text = text.replace(/!\[([^\]]*?)\]\([^\)]*?\)/g, '$1');

  // 6. 处理链接 [text](url)
  text = text.replace(/\[([^\]]+?)\]\([^\)]*?\)/g, '$1');

  // 7. 移除 mdx 组件（支持多行，首字母大写的组件）
  text = text.replace(/<[A-Z]\w*[^>]*\/>/g, '');
  text = text.replace(/<[A-Z]\w*[^>]*>[\s\S]*?<\/[A-Z]\w*>/g, '');

  // 8. 处理 HTML 标签（只保留内容）
  text = text.replace(/<[^>]+>(.*?)<\/[^>]+>/gs, '$1');
  // 单标签如 <br/> 直接移除
  text = text.replace(/<[^>]+\/>/g, '');

  // 9. 处理强调 *text* 或 **text**（避免嵌套干扰）
  text = text.replace(/\*\*([^*]+?)\*\*/g, '$1');
  text = text.replace(/\*([^*]+?)\*/g, '$1');
  text = text.replace(/__([^_]+?)__/g, '$1');
  text = text.replace(/_([^_]+?)_/g, '$1');

  // 10. 处理引用 > text（考虑行首空格和多级引用）
  text = text.replace(/^\s*>+\s?/gm, '');

  // 11. 处理任务列表 - [ ] text 或 - [x] text（考虑行首空格）
  text = text.replace(/^\s*[-*+]\s*\[[ xX]\]\s*/gm, '');

  // 12. 处理表格 - 正确提取单元格内容
  text = text.replace(/^\s*\|(.+)\|\s*$/gm, (match, content) => {
    // 如果是分隔线（只包含 - : | 和空格），则移除整行
    if (/^[\s\-:|]+$/.test(content)) {
      return '';
    }
    // 否则提取单元格内容，用空格分隔
    return content.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell.length > 0).join(' ');
  });

  // 13. 处理标题标记 # ## ### 等
  text = text.replace(/^\s*#{1,6}\s+/gm, '');

  // 14. 处理列表标记 - * +（但不处理任务列表，因为已经在步骤11处理了）
  text = text.replace(/^\s*[-*+](?!\s*\[)\s+/gm, '');

  // 15. 移除多余空白字符
  text = text.replace(/\r?\n/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text.length;
}