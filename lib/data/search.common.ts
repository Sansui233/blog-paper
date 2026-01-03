/**
 * Post search index object for client-side search
 * Generated from velite posts data
 */
export interface PostSearchObj {
  id: string
  title: string
  content: string // plain text content for search
  tags: string[]
  description: string
  keywords: string[]
  date: string
}

export const POSTS_SEARCH_INDEX_FILE = 'posts-search-index.json'

/**
 * Memo search index object for client-side search
 * Generated from velite memos data
 *
 * 索引包含：最近100条 Memo + 所有带 Tag 的 Memo
 * content 为原始 Markdown（客户端渲染）
 */
export interface MemoSearchObj {
  id: string        // date format: 2026-01-03 23:29:02
  tags: string[]
  content: string   // raw markdown for client-side rendering
}

export const MEMO_SEARCH_INDEX_FILE = 'memo-search-index.json'