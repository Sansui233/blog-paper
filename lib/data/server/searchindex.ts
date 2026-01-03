import type { Post } from '.velite';
import fs from "fs";
import path from "path";
import { type PostSearchObj, POSTS_SEARCH_INDEX_FILE } from "../search.common";

const DATADIR = path.join(process.cwd(), 'public', 'data')

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
export async function buildSearchIndex(postsData: Post[]) {
  console.log("🔍 [searchindex.ts] building search index from Velite...")

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