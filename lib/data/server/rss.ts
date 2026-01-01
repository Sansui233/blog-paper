import { Feed, type Item } from "feed";
import fs from 'fs';
import matter from "gray-matter";
import path from 'path';
import readline from 'readline';
import { siteInfo } from "../../../site.config";
import { parseDate } from "../../date";
import { grayMatter2PostMeta } from "../../markdown/frontmatter";
import { compileMdxRss } from "../../markdown/mdx";
import type { PostMeta } from "../posts.common";
import { MEMOS_DIR } from "./memos";
import { POST_DIR, getFrontMatter, posts_db } from './posts';

/**
 * get recent 10 posts
 */
async function getPosts(): Promise<Item[]> {

  console.log("\n🌱 [rss.ts] generate post rss")

  let fileNames = await fs.promises.readdir(POST_DIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") // TODO MDX support
  })

  const readPromises = fileNames.map(async fileName => {

    const fileContents = await fs.promises.readFile(path.join(POST_DIR, fileName), 'utf-8')
    const mattered = matter(fileContents)
    const frontmatter: PostMeta = grayMatter2PostMeta(mattered)

    const parsed: PostMeta & { content: string, id: string, type: "md" | "mdx" } = {
      id: fileName.replace(/\.mdx?$/, ''),
      content: mattered.content,
      type: "md", // TODO MDX support
      ...frontmatter,
    }

    return parsed

  })

  const compilePromises = (await Promise.all(readPromises))
    .filter(p => !p.draft)
    .map(async p => {

      const htmlcontent = await (compileMdxRss(p.content, p.type))

      return {
        title: p.title,
        id: `${siteInfo.domain}/posts/${p.id}`,
        guid: `${siteInfo.domain}/posts/${p.id}`,
        link: `${siteInfo.domain}/posts/${p.id}`,
        published: parseDate(p.date),
        date: parseDate(p.date), // TODO Bug may not be a real string?
        description: p.description ? p.description : '',
        category: [
          {
            name: p.categories,
            domain: `${siteInfo.domain}/categories/${p.categories}`
          }],
        content: htmlcontent,
      }
    })

  let allPosts: Item[] = await Promise.all(compilePromises)

  const memo = await getMemo()
  if (memo !== null) {
    allPosts.push(memo)
  }


  allPosts = allPosts.sort((a, b) => {
    return a.date > b.date ? -1 : 1
  })

  // Filter drafts
  let res = []
  for (let p of allPosts) {
    if ('draft' in p && p.draft === true) {
      continue
    } else {
      res.push(p)
    }
  }

  res.splice(10)
  return res
}

// 最新（名称最大）的 memo 文件中，最近 6 条生成 rss
async function getMemo(): Promise<Item | null> {
  const files = (await fs.promises.readdir(MEMOS_DIR)).filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })

  // get recent non-draft memo files
  let f = ""
  for (let fileName of files) {
    const fm = grayMatter2PostMeta(await getFrontMatter(fileName, MEMOS_DIR))
    if ('draft' in fm && fm.draft === true) {
      continue
    } else {
      f = fileName;
      break;
    }
  }

  if (f === "") {
    return null
  }


  console.log("🌱 [rss.ts] generate memo rss")

  const fileStream = fs.createReadStream(path.join(MEMOS_DIR, f))
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  // get memo content
  let count = 0
  let content = ""
  for await (const line of rl) {
    if (line.startsWith("## ")) {
      if (count === 7) break
      count++
    }
    if (count != 0) content += line + "\n" // push content
  }

  rl.close()
  fileStream.close()

  // parse target file front matter
  const matterResult = grayMatter2PostMeta(await getFrontMatter(f, MEMOS_DIR))
  // convert markdown to html
  const htmlcontent = await (compileMdxRss(content, "md"))

  const res = {
    title: matterResult.title,
    id: `${siteInfo.domain}/memos?id=${matterResult.date}`, // 修改时间戳将触发 rss 对于本内容的更新
    guid: `${siteInfo.domain}/memos?id=${matterResult.date}`, // 修改时间戳将触发 rss 对于本内容的更新
    link: `${siteInfo.domain}/memos`,
    date: parseDate(matterResult.date),
    published: parseDate(matterResult.date),
    description: matterResult.description ? matterResult.description : '',
    category: [
      {
        name: matterResult.categories
      }],
    content: htmlcontent
  }

  return res
}

async function createRss() {
  /** File Info */
  const feed = new Feed({
    title: `${siteInfo.author}'s blog`,
    description: "记录学习和生活的个人博客",
    id: siteInfo.domain,
    link: siteInfo.domain,
    language: "zh-CN", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: `${SiteInfo.domain}/avatar-white.png`,
    favicon: `${siteInfo.domain}/favicon.ico`,
    copyright: `All rights reserved 2022, ${siteInfo.author}`,
    // updated: new Date(2013, 6, 14), // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      //   json: "https://example.com/json",
      json: `${siteInfo.domain}/feed.json`,
      atom: `${siteInfo.domain}/atom.xml`,
      rss: `${siteInfo.domain}/rss`,
    },
    author: {
      name: siteInfo.author,
      email: siteInfo.social.email,
      link: `${siteInfo.domain}/about.ico`
    }
  });

  const posts = await getPosts()

  posts.forEach(p => {
    feed.addItem(p)
  })

  return feed
}

async function writeRss() {
  const feed = await createRss()
  console.log("🌱 [rss.ts] write rss")
  fs.promises.writeFile("./public/atom.xml", feed.atom1());
  fs.promises.writeFile("./public/rss", feed.rss2());
  fs.promises.writeFile("./public/feed.json", feed.json1());
}

async function writeSiteMap() {
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
    ${posts_db.metas
      .map(({ id }) => {
        return `
  <url>
    <loc>${`${siteInfo.domain}/posts/${encodeURIComponent(id)}`}</loc>
  </url>
    `;
      })
      .join('')}
    ${Object.keys(posts_db.categories())
      .map((c) => {
        return `
  <url>
    <loc>${`${siteInfo.domain}/categories/${encodeURIComponent(c)}`}</loc>
  </url>
    `;
      })
      .join('')}
    ${Object.keys(posts_db.tags())
      .map((t) => {
        return `
  <url>
    <loc>${`${siteInfo.domain}/tags/${encodeURIComponent(t)}`}</loc>
  </url>
    `;
      })
      .join('')}
</urlset>
`;

  fs.promises.writeFile("./public/sitemap.xml", content);
}

export { writeRss, writeSiteMap };

