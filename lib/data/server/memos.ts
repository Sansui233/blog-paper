import fs from "fs";
import path from "path";
import readline from "readline";
import { dateToYMDMM, parseDate } from "../../date";
import { getLastModTime, writeJson } from "../../fs/fs";
import { INFOFILE, MemoPost, MemoTag } from "../memos.common";
import { MemoFileMap, MemoInfoExt, MemoPageMap } from "./type";

export const MEMOS_DIR = path.join(process.cwd(), 'source', 'memos')
const MEMO_CSR_DATA_DIR = path.join(process.cwd(), 'public', 'data', 'memos')

/**
 * memos database
 * 构造函数返回一个 memo_db 对象
 * 
 * - memos 是所有的 memo 内容，会加载进内存  
 * - imgs 是所有的图片信息，之后建立相册用
 */
const memo_db = await (async function () {

  /**
   * Exported properies
   */
  const filenames = await ((async () => {
    let fileNames = await fs.promises.readdir(MEMOS_DIR);
    return fileNames.filter(f => {
      return f.endsWith(".md")
    }).sort((a, b) => {
      return a < b ? 1 : -1 // Desc for latest first
    })
  })())

  const tags: MemoTag[] = [];
  const memos: MemoPost[] = []
  const imgs: MemoPost[] = []
  const fileMap: MemoFileMap[] = []
  const pageMap: MemoPageMap[] = []

  /**
   * Get memos by page. SSR only
   * @param page number from 0
   */
  const atPage = function (page: number) {
    return memos.filter(m => {
      return m.csrIndex[0] === page
    })
  }

  /**
   *   Core Initialize
   **/

  console.log("[memos.ts] parsing memos...")

  let csrPage = -1;
  let csrIndex = 9;

  for (const src_file of filenames) {

    // state
    let isFirstLine = true
    let isFrontMatter = false
    let isFirstMemo = true

    const fileStream = fs.createReadStream(path.join(MEMOS_DIR, src_file))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl) {
      if (line.startsWith("---") && isFirstLine) {
        if (isFrontMatter) { // front matter end
          isFrontMatter = false
          isFirstLine = false
          continue
        } else {
          isFrontMatter = true // front matter start
          continue
        }
      } else if (isFrontMatter) {
        continue; //ignore in front matter
      } else if (line.startsWith("## ")) {

        updateLastFile(memos, tags, imgs, fileMap)

        // 更新索引状态
        csrIndex += 1;
        if (csrIndex === 10) {
          if (pageMap.length > 0) {
            pageMap[pageMap.length - 1].endDate = parseDate(memos[memos.length - 1].id).getTime()
          }

          csrPage += 1;
          csrIndex = 0;

          pageMap.push({
            page: csrPage,
            startDate: parseDate(line.slice(3)).getTime(),
            endDate: -1,
          })
        }

        /**
         * add new memo
         */

        memos.push({
          id: line.slice(3),
          content: "",
          tags: [],
          imgsmd: [],
          sourceFile: src_file,
          csrIndex: [csrPage, csrIndex],
        })

        // add new info
        if (isFirstMemo) {
          fileMap.push({
            srcName: src_file,
            lastModified: (await getLastModTime(path.join(MEMOS_DIR, src_file))).getTime(),
            dateRange: { start: dateToYMDMM(parseDate(memos[memos.length - 1].id)), end: "" },
            startAt: {
              page: csrPage,
              index: csrIndex,
            },
            endAt: {
              page: -1,
              index: -1,
            }
          })
          isFirstMemo = false
        }

      } else {

        // detect imgs
        const imgreg = /\!\[.*\]\(.+\)/g;
        const matches = line.match(imgreg);
        if (matches) {
          // console.debug("%%", memos[memos.length - 1].id, matches),
          memos[memos.length - 1].imgsmd.push(...matches)
        } else {
          // update memo content
          if (memos.length === 0) continue // 忽略 frontmatter 和 ## 之间的空行
          const m = memos[memos.length - 1]
          m.content += line + "\n"
        }
      }
    }

    rl.close()
    fileStream.close()
  }

  // 文件遍历结束时更新最后一条信息
  updateLastFile(memos, tags, imgs, fileMap)
  const info: MemoInfoExt = {
    pages: csrPage,
    memos: memos.length,
    tags: tags.length,
    imgs: imgs.length,
    fileMap,
    pageMap,
  }

  console.log(`[memos.ts] ${memos.length} memos in total`)

  return {
    filenames,
    memos,
    tags,
    info,
    imgs,
    atPage,
  }
})()


// 根据 memoPost 内容，提取 tags, imgs, fileMap 的状态信息，记录至 MemPost
// 如果有图片，也记录至 imgs
function updateLastFile(memos: MemoPost[], tags: MemoTag[], imgs: MemoPost[], fileMap: MemoFileMap[]) {
  if (memos.length > 0) {

    const lastMemo = memos[memos.length - 1]
    const text = lastMemo.content

    // update tags
    const matches = extractTagsFromMarkdown(text)
    matches.map(t => {

      const target = tags.find((v) => v.name === t)

      if (target) {
        target.memoIds.push(lastMemo.id)
      } else {
        tags.push({
          name: t,
          memoIds: [lastMemo.id]
        })
      }

      if (!lastMemo.tags.includes(t)) lastMemo.tags.push(t)
    })

    // update imgs
    if (lastMemo.imgsmd.length !== 0) {
      imgs.push(lastMemo)
    }


    // update last info
    const lastInfo = fileMap[fileMap.length - 1]
    lastInfo.dateRange.end = dateToYMDMM(parseDate(lastMemo.id))
    lastInfo.endAt = { page: lastMemo.csrIndex[0], index: lastMemo.csrIndex[1] }

  }
}

/**
 *  return "[tag1,tag2]"
 */
function extractTagsFromMarkdown(markdown: string) {
  const title = ["#", "##", "###", "####", "#####", "######"]
  const tags: string[] = [];
  let tmp = ""
  let ignore = false

  for (let i = 0; i < markdown.length; i++) {
    const v = markdown[i];

    // ignore in code
    if (v === "`") {
      ignore = !ignore
      if (ignore) tmp = ``
    }

    if (!ignore) {
      if (tmp.length > 0) { // when in tag
        if (v === " " || v === "\n" || v === "\r\n") {
          if (!title.includes(tmp)) {
            tags.push(tmp.slice(1))
          }
          tmp = ""
        } else {
          tmp += v
        }
      } else if (v === "#" && (i === 0 || markdown[i - 1] === " " || markdown[i - 1] === "\n")) { // detect tag start
        tmp += v
      }
    }
  }

  if (tmp.length > 0) tags.push(tmp.slice(1))

  return tags;
}


function writeMemoJson() {

  // CSR page
  // Map<page, postlist>
  const groupByPage = new Map<number, MemoPost[]>()
  let maxpage = 0;

  //group by page
  memo_db.memos.forEach(m => {
    const p = m.csrIndex[0]
    if (groupByPage.has(p)) {
      groupByPage.get(p)?.push(m)
    } else {
      groupByPage.set(p, [m])
    }
    maxpage = p > maxpage ? p : maxpage;
  })

  // write by page
  groupByPage.forEach((memos, page) => {
    writeJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`), memos)
  })

  //write other csr file
  writeJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE), memo_db.info)
  writeJson(path.join(MEMO_CSR_DATA_DIR, `tags.json`), memo_db.tags)
  writeJson(path.join(MEMO_CSR_DATA_DIR, `imgs.json`), memo_db.imgs)
}

export { memo_db, writeMemoJson };

