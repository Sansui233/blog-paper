import type { Memo } from '.velite';
import { Feed, type Item } from "feed";
import fs from 'fs';
import { siteInfo } from "site.config";
import { toHTML } from "../../md-compile/compile";
import { buildPostsDB, type Post } from './posts';

/**
 * Build RSS feed items from posts and memos data
 */
async function buildFeedItems(
  postsData: Post[],
  memosData: Memo[]
): Promise<Item[]> {
  console.log("\n🌱 [rss.ts] generate post rss")

  // Build posts DB from data
  const db = buildPostsDB(postsData)

  // Use velite pre-built posts, already sorted by date desc
  const recentPosts = db.velite
    .filter(p => !p.draft)
    .slice(0, 10)

  const postItems: Item[] = recentPosts.map(p => ({
    title: p.title,
    id: `${siteInfo.domain}/posts/${p.slug}`,
    guid: `${siteInfo.domain}/posts/${p.slug}`,
    link: `${siteInfo.domain}/posts/${p.slug}`,
    published: new Date(p.date),
    date: new Date(p.date),
    description: p.description ?? '',
    category: p.categories ? [{
      name: p.categories,
      domain: `${siteInfo.domain}/categories/${p.categories}`
    }] : [],
    content: p.content_html,
  }))

  // Add memo item
  const memo = await buildMemoItem(memosData)
  if (memo !== null) {
    postItems.push(memo)
  }

  // Sort all items by date desc
  postItems.sort((a, b) => b.date.getTime() - a.date.getTime())

  return postItems.slice(0, 10)
}

/**
 * Build memo RSS item from the newest (largest filename) memo file
 */
async function buildMemoItem(memosData: Memo[]): Promise<Item | null> {
  // Sort memo files by file_path desc to get the latest file
  const sortedMemoFiles = [...memosData]
    .filter(m => !m.draft)
    .sort((a, b) => a.file_path < b.file_path ? 1 : -1)

  if (sortedMemoFiles.length === 0) {
    return null
  }

  const latestFile = sortedMemoFiles[0]
  const recentMemos = latestFile.memos.slice(0, 6)

  if (recentMemos.length === 0) {
    return null
  }

  console.log("🌱 [rss.ts] generate memo rss")

  // Compile memo contents to HTML
  const memoContents = await Promise.all(
    recentMemos.map(m => toHTML(m.content, {}, "md"))
  )

  const htmlContent = memoContents
    .map((html, i) => `<h2>${recentMemos[i].id}</h2>\n${html}`)
    .join('\n<hr/>\n')

  return {
    title: latestFile.title,
    id: `${siteInfo.domain}/memos?id=${latestFile.date}`,
    guid: `${siteInfo.domain}/memos?id=${latestFile.date}`,
    link: `${siteInfo.domain}/memos`,
    date: new Date(latestFile.date),
    published: new Date(latestFile.date),
    description: latestFile.description ?? '',
    category: [],
    content: htmlContent
  }
}

function createFeed(items: Item[]) {
  const feed = new Feed({
    title: `${siteInfo.author}'s blog`,
    description: "记录学习和生活的个人博客",
    id: siteInfo.domain,
    link: siteInfo.domain,
    language: "zh-CN",
    favicon: `${siteInfo.domain}/favicon.ico`,
    copyright: `All rights reserved 2022, ${siteInfo.author}`,
    feedLinks: {
      json: `${siteInfo.domain}/feed.json`,
      atom: `${siteInfo.domain}/atom.xml`,
      rss: `${siteInfo.domain}/rss`,
    },
    author: {
      name: siteInfo.author,
      email: siteInfo.social.email,
      link: `${siteInfo.domain}/about`
    }
  });

  items.forEach(p => feed.addItem(p))
  return feed
}

/**
 * Build and write RSS files from velite pipeline data
 * Called from velite.config.ts complete hook
 */
async function buildRss(postsData: Post[], memosData: Memo[]) {
  const items = await buildFeedItems(postsData, memosData)
  const feed = createFeed(items)

  console.log("🌱 [rss.ts] write rss")
  await Promise.all([
    fs.promises.writeFile("./public/atom.xml", feed.atom1()),
    fs.promises.writeFile("./public/rss", feed.rss2()),
    fs.promises.writeFile("./public/feed.json", feed.json1()),
  ])
}

/**
 * Build and write sitemap from velite pipeline data
 * Called from velite.config.ts complete hook
 */
async function buildSiteMap(postsData: Post[]) {
  const db = buildPostsDB(postsData)

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteInfo.domain}</loc>
  </url>
  <url>
    <loc>${siteInfo.domain}/about</loc>
  </url>
  <url>
    <loc>${siteInfo.domain}/memos</loc>
    <changefreq>always</changefreq>
  </url>
  ${db.velite
    .map(p => `<url>
    <loc>${siteInfo.domain}/posts/${encodeURIComponent(p.slug)}</loc>
  </url>`)
    .join('\n  ')}
  ${Array.from(db.categories.keys())
    .map(c => `<url>
    <loc>${siteInfo.domain}/categories/${encodeURIComponent(c)}</loc>
  </url>`)
    .join('\n  ')}
  ${Array.from(db.tags.keys())
    .map(t => `<url>
    <loc>${siteInfo.domain}/tags/${encodeURIComponent(t)}</loc>
  </url>`)
    .join('\n  ')}
</urlset>
`;

  console.log("🌱 [rss.ts] write sitemap.xml")

  await fs.promises.writeFile("./public/sitemap.xml", content);
}

// Legacy exports for backward compatibility (use static imports)
async function writeRss() {
  const { posts, memos } = await import('.velite')
  await buildRss(posts, memos)
}

async function writeSiteMap() {
  const { posts } = await import('.velite')
  await buildSiteMap(posts)
}

export { buildRss, buildSiteMap, writeRss, writeSiteMap };

