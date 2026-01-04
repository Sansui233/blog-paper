import fs from "fs";
import path from "path";
import type veliteConfig from 'velite.config';
import { MEMO_SEARCH_INDEX_FILE, POSTS_SEARCH_INDEX_FILE, type MemoSearchObj, type PostSearchObj } from "../search.common";

const DATADIR = path.join(process.cwd(), 'public', 'data')

// Infer types from velite.config.ts schema (same as .velite/index.d.ts but without dependency on generated files)
type Collections = typeof veliteConfig.collections;
type Post = Collections['posts']['schema']['_output'];
type Memo = Collections['memos']['schema']['_output'];

/**
 * Strip HTML tags and convert to plain text for search indexing
 */
function htmlToPlainText(html: string): string {
  return html
    // Remove script and style tags with content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build search index from velite posts data
 * Called from velite.config.ts complete hook
 */
export async function buildPostsSearchIndex(postsData: Post[]) {
  console.log("🔍 [searchindex.ts] building posts search index...")

  const index: PostSearchObj[] = postsData
    .filter(p => !p.draft)
    .map(p => ({
      id: p.slug,
      title: p.title,
      content: htmlToPlainText(p.content_html),
      tags: p.tags ?? [],
      description: p.description ?? '',
      keywords: p.keywords ?? [],
      date: p.date,
    }))
    .sort((a, b) => a.date < b.date ? 1 : -1)

  await fs.promises.mkdir(DATADIR, { recursive: true })
  await fs.promises.writeFile(
    path.join(DATADIR, POSTS_SEARCH_INDEX_FILE),
    JSON.stringify(index)
  )

  console.log(`🔍 [searchindex.ts] ${index.length} posts indexed`)
}

const MEMO_RECENT_LIMIT = 100

/**
 * Build memo search index from velite memos data
 * 索引包含：最近100条 Memo + 所有带 Tag 的 Memo（去重）
 * content 为原始 Markdown（客户端渲染）
 *
 * Called from velite.config.ts complete hook
 */
export async function buildMemoSearchIndex(memosData: Memo[]) {
  console.log("🔍 [searchindex.ts] building memo search index...")

  // 1. Sort by source file name desc, flatten memos
  const sortedFiles = [...memosData]
    .sort((a, b) => a.file_path < b.file_path ? 1 : -1)

  const allMemos = sortedFiles.flatMap(file => file.memos)

  // 2. Build index: recent 100 + all tagged (deduplicated)
  const recentMemos = allMemos.slice(0, MEMO_RECENT_LIMIT)
  const taggedMemos = allMemos.filter(m => m.tags.length > 0)

  // Deduplicate by id using Set
  const indexedIds = new Set<string>()
  const index: MemoSearchObj[] = []

  // Add recent memos first
  for (const memo of recentMemos) {
    if (!indexedIds.has(memo.id)) {
      indexedIds.add(memo.id)
      index.push({
        id: memo.id,
        tags: memo.tags,
        content: memo.content,
        imgs_md: memo.imgs_md,
      })
    }
  }

  // Add tagged memos (may overlap with recent)
  for (const memo of taggedMemos) {
    if (!indexedIds.has(memo.id)) {
      indexedIds.add(memo.id)
      index.push({
        id: memo.id,
        tags: memo.tags,
        content: memo.content,
        imgs_md: memo.imgs_md,
      })
    }
  }

  await fs.promises.mkdir(DATADIR, { recursive: true })
  await fs.promises.writeFile(
    path.join(DATADIR, MEMO_SEARCH_INDEX_FILE),
    JSON.stringify(index)
  )

  console.log(`🔍 [searchindex.ts] ${index.length} memos indexed (${recentMemos.length} recent + ${taggedMemos.length} tagged, deduplicated)`)
}

export async function buildSearchIndex(postsData: Post[],memosData: Memo[]) {
  await buildPostsSearchIndex(postsData)
  await buildMemoSearchIndex(memosData)
}