import { posts, type Post } from '.velite'
import { dateToYMDMM } from 'lib/date'

const CATEGORY_ALL = 'All Posts'
const TAG_UNTAGGED = 'Untagged'

type PostsDB = ReturnType<typeof buildPostsDB>

/**
 * Build posts database from velite data
 */
function buildPostsDB(postsData: Post[]) {
  console.log("[posts.ts] building posts database from Velite...")

  /**
   * metas sorted by date (newest first)
   */
  const velite = [...postsData].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  /**
   * slugs array for pre-rendering
   */
  const slugs = velite.map(p => p.slug)

  /**
   * categories with post counts
   */
  const categories = (function () {
    const cats = new Map<string, number>()
    cats.set(CATEGORY_ALL, velite.length)

    velite.forEach(p => {
      if (p.categories) {
        const c = p.categories
        cats.set(c, (cats.get(c) || 0) + 1)
      }
    })

    return cats
  })()

  /**
   * tags with post counts
   */
  const tags = (function () {
    const tagMap = new Map<string, number>()
    let untaggedCount = 0

    velite.forEach(p => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach(t => {
          tagMap.set(t, (tagMap.get(t) || 0) + 1)
        })
      } else {
        untaggedCount++
      }
    })

    if (untaggedCount > 0) {
      tagMap.set(TAG_UNTAGGED, untaggedCount)
    }

    return tagMap
  })()

  /**
   * return posts in tag t, sorted by date
   */
  function inTag(t: string) {
    return velite
      .filter(p => p.tags && p.tags.includes(t) || (t === TAG_UNTAGGED && p.tags && p.tags.length === 0))
      .map(p => ({
        slug: p.slug,
        title: p.title,
        date: new Date(p.date)
      }))
  }

  /**
   * return posts in category c, sorted by date
   */
  function inCategory(c: string) {
    return velite
      .filter(p => c === CATEGORY_ALL || p.categories === c)
      .map(p => ({
        slug: p.slug,
        title: p.title,
        date: new Date(p.date)
      }))
  }

  /**
   * get a single post by slug
   */
  function getBySlug(slug: string): Post | undefined {
    return velite.find(p => p.slug === slug)
  }

  return {
    velite,
    slugs,
    categories,
    tags,
    inTag,
    inCategory,
    getBySlug,
  }
}

/**
 * Posts database built from Velite pre-processed data (static import)
 * Used at runtime when velite data is already built
 */
const posts_db: PostsDB = buildPostsDB(posts)

/**
 * Group posts data by year in an Object
 */
function groupByYear(posts: {
  slug: string,
  title: string,
  date: Date,
}[]): {
  [year: string]: {
    slug: string;
    title: string;
    date: string;
  }[];
} {
  const postsTree = new Map<number, { slug: string, title: string, date: string }[]>()

  posts.forEach(p => {
    const y = p.date.getFullYear()
    const entry = {
      slug: p.slug,
      title: p.title,
      date: dateToYMDMM(p.date)
    }

    if (postsTree.has(y)) {
      postsTree.get(y)!.push(entry)
    } else {
      postsTree.set(y, [entry])
    }
  })

  return Object.fromEntries(postsTree)
}

export { buildPostsDB, groupByYear, posts_db }
export type { Post, PostsDB }

