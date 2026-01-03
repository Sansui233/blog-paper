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