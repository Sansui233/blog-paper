import fs from "fs";
import path from "path";
import { loadJson, writeJson } from "../../fs/fs";
import { observe } from "../../fs/observer";
import { grayMatter2PostMeta } from "../../markdown/frontmatter";
import type { SearchObj } from "../../search";
import { getFrontMatter } from "./posts";

const DATADIR = path.join(process.cwd(), 'public', 'data')
const SEARCHJSON = 'index.json'
const OBSERVEINFO = 'status.json'

/**
 * generate index file for all posts
 */
async function buildIndex(src_dir: string, index_dir = DATADIR, index_f = SEARCHJSON, status_f = OBSERVEINFO) {

  // The format of index is a list of SearchObj
  let index: Array<Omit<Required<SearchObj>, 'tags'>> = []

  // Get updated file lists in source  dir
  const fl = await observe(
    src_dir,
    path.join(index_dir, status_f),
    (o, n) => { return o.mtime === n.mtime.getTime() },
    (info) => {
      return info
    },
    ".md",
  )

  // Load index file
  index = await loadJson(path.join(index_dir, index_f))
  if (!index) {
    index = []
  }

  fl.del.map(n => {
    // delete in index
    const i = find(index, n)
    if (i === -1) {
      console.error(`[search.ts] unexpected del index not found`)
      return
    }
    index.splice(i, 1)
  })

  const modPromise = fl.mod.map(async n => {
    const i = find(index, n)
    const fm = grayMatter2PostMeta(await getFrontMatter(n))
    index[i] = ({
      id: n,
      title: fm.title,
      content: (await getContent(path.join(src_dir, n))).replaceAll("\n", ""),
      description: fm.description ? fm.description : "",
      keywords: fm.keywords ? fm.keywords : "",
      date: fm.date
    })
  })

  const createPromise = fl.create.map(async n => {
    const i = find(index, n)
    const fm = grayMatter2PostMeta(await getFrontMatter(n))
    index.push({
      id: n,
      title: fm.title,
      content: await getContent(path.join(src_dir, n)),
      description: fm.description ? fm.description : "",
      keywords: fm.keywords ? fm.keywords : "",
      date: fm.date
    })
  })

  await Promise.all(modPromise.concat(createPromise))

  index = index.sort((a, b) => a.date < b.date ? 1 : -1)
  writeJson(path.join(index_dir, index_f), index)

  console.log("[buildindex.ts]", fl.create.length + fl.del.length + fl.mod.length, "pages updated")
  console.log("[buildindex.ts]", index.length, "pages are indexed")
}

function find(index: SearchObj[], id: string) {
  for (let i = 0; i < index.length; i++) {
    if (index[i].id === id) return i
  }
  return -1
}

async function getContent(filepath: string) {
  let content = await fs.promises.readFile(filepath, 'utf-8')
  content = content.replace(/---([\s\S]*?)---/, '') // Remove YAML header
  return content.replace(/^\s+|\s+$/g, '')
}

export { buildIndex };

