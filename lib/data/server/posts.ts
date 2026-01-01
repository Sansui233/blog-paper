import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { dateToYMDMM } from '../../date';
import { grayMatter2PostMeta } from '../../markdown/frontmatter';

export const POST_DIR = path.join(process.cwd(), 'source', 'posts')
const CATEGORY_ALL = 'All Posts'
const TAG_UNTAGGED = 'Untagged'

/**
 * posts database
 * 构造函数返回一个 posts_db 对象
 * 
 * - 数据集中存储于 metas，其他的字段信息从 metas 动态获取
 * - 不存储正文内容本身，需要单独 parse
 */
const posts_db = await (async function () {

  console.log("[posts.ts] building posts database...")

  /*
  * source file names
  */
  const filenames = await ((async () => {
    let fileNames = await fs.promises.readdir(POST_DIR);
    fileNames = fileNames.filter(f => {
      return f.endsWith(".md") || f.endsWith(".mdx")
    })
    return fileNames
  })())

  /**
 * metas sorted by date
 */
  const metas = await (async function () {
    const promises = filenames.map(async fileName => {
      const id = fileName.replace(/\.mdx?$/, '')

      const frontMatter = grayMatter2PostMeta((await getFrontMatter(fileName)))
      return {
        id,
        ...frontMatter,
      }
    })

    const allPosts = await Promise.all(promises)
    return allPosts.sort((a, b) => {
      return a.date < b.date ? 1 : -1
    })
  })()

  /**
   * used in url
   */
  const ids = function () {
    return filenames.map(f => {
      return {
        params: {
          id: f.replace(/\.mdx?$/, '').replaceAll(" ", "-")
        }
      };
    });
  }

  const categories = function () {
    const categories = new Map<string, number>()
    const p = filenames
    categories.set(CATEGORY_ALL, p.length)

    metas.forEach(p => {
      if (p.categories) {
        const c = p.categories
        if (categories.has(c)) {
          categories.set(c, categories.get(c)! + 1)
        } else {
          categories.set(c, 1)
        }
      }
    })

    return categories
  }



  const tags = function () {
    const tags = new Map<string, number>()
    tags.set(TAG_UNTAGGED, 0)

    metas.forEach(p => {
      if (p.tags) {
        let fileTags = p.tags
        fileTags = typeof (fileTags) === 'string' ? [fileTags] : fileTags
        fileTags.forEach((t: string) => {
          if (tags.has(t)) {
            tags.set(t, tags.get(t)! + 1)
          } else {
            tags.set(t, 1)
          }
        })
      } else {
        tags.set(TAG_UNTAGGED, tags.get(TAG_UNTAGGED)! + 1)
      }
    })

    return tags
  }

  /**
 * return posts in tag t, sorted by date
 */
  const inTag = async function (t: string) {

    const posts: { id: string, title: string, date: Date }[] = []

    metas.forEach(p => {
      if (p.tags.some((ft: string) => ft === t)) {
        posts.push({
          id: p.id,
          title: p.title,
          date: new Date(p.date)
        })
      }
    })

    return posts.sort((a, b) => a.date < b.date ? 1 : -1)
  }

  /**
   * return posts in category c, sorted by date
   */
  const inCategory = async function (c: string) {
    const posts: { id: string, title: string, date: Date }[] = []

    metas.forEach(p => {
      if (c === CATEGORY_ALL || (p.categories && p.categories === c)) {
        posts.push({
          id: p.id,
          title: p.title,
          date: new Date(p.date)
        })
      }

    })

    return posts.sort((a, b) => a.date < b.date ? 1 : -1)
  }

  return {
    filenames,
    metas,
    ids,
    categories,
    tags,
    inTag,
    inCategory
  }
})()



/**
 * Get front matter info from a local markdown file
 */
async function getFrontMatter(fileName: string, dir = POST_DIR) {
  const fullPath = path.join(dir, fileName)
  const fileContents = await fs.promises.readFile(fullPath, 'utf8')
  return matter(fileContents)
}


/**
 * Group posts data by year in an Object
 */
function groupByYear(posts: {
  id: string,
  title: string,
  date: Date,
}[]): {
  [year: string]: {
    id: string;
    title: string;
    date: string;
  }[];
} {
  const postsTree = new Map<number, { id: string, title: string, date: string }[]>() //<year,post[]>
  posts.forEach(p => {
    const y = p.date.getFullYear()
    if (postsTree.has(y)) {
      postsTree.get(y)!.push({
        id: p.id,
        title: p.title,
        date: dateToYMDMM(p.date)
      })
    } else {
      postsTree.set(y, [{
        id: p.id,
        title: p.title,
        date: dateToYMDMM(p.date)
      }])
    }
  })

  return Object.fromEntries(postsTree)
}

export { getFrontMatter, groupByYear, posts_db };

