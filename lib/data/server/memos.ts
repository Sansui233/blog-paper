import { writeJson } from "lib/fs/fs";
import type veliteConfig from "velite.config";

import { toMdxCode } from "lib/md-compile/compile";
import { remarkTag } from "lib/remark/remark-tag";
import path from "path";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  INFOFILE,
  type MemoInfo,
  type MemoPost,
  type MemoPostJsx,
  type MemoTag,
} from "../memos.common";

import ReadingTime from "reading-time";

type Collections = typeof veliteConfig.collections;
type Memo = Collections["memos"]["schema"]["_output"];

const MEMO_CSR_DATA_DIR = path.join(process.cwd(), "public", "data", "memos");
const PAGE_SIZE = 10;

/**
 * Velite Processor: 一整文件的 Memo markdown raw string，按二级标题分割成多条 MemoPost
 * 1. 提取中其中的整行 Img，并且 content 中不记录此 img 行
 * 2. 提取其中的 Tags
 */
export function splitMemo(raw: string, sourceFile: string = ""): MemoPost[] {
  const memos: MemoPost[] = [];
  const lines = raw.split("\n");

  for (const line of lines) {
    if (line.startsWith("## ")) {
      // Extract tags from previous memo before starting new one
      if (memos.length > 0) {
        const lastMemo = memos[memos.length - 1];
        lastMemo.tags = extractTagsFromMarkdown(lastMemo.content);
      }

      // Start new memo
      memos.push({
        id: line.slice(3), // title after ##
        content: "",
        tags: [],
        imgs_md: [],
        sourceFile,
        csrIndex: [-1, -1], // Will be set later
        word_count: -1, // placeholder, will be set later
      });
    } else {
      if (memos.length === 0) continue; // Ignore lines before first ##

      // Detect images (whole line)
      const imgreg = /^\!\[.*\]\(.+\)$/;
      if (imgreg.test(line.trim())) {
        memos[memos.length - 1].imgs_md.push(line.trim());
      } else {
        // Add to content
        memos[memos.length - 1].content += line + "\n";
      }
    }
  }

  // word count
  memos.forEach((memo) => {
    const meta = ReadingTime(memo.content);
    memo.word_count = meta.words;
  });

  // Extract tags from last memo
  if (memos.length > 0) {
    const lastMemo = memos[memos.length - 1];
    lastMemo.tags = extractTagsFromMarkdown(lastMemo.content);
  }

  return memos;
}

/**
 * Memo CSR Public Folder:
 * 1. paged MemoPost[] json files
 * 2. imgs.json: array of MemoPost with imgs_md not empty
 * 3. tags.json: array of MemoTag
 */
export async function buildMemoCsrData(memos: Memo[]) {
  // 1. Read all memos from pre-built velite json files
  const memoPosts = memos;

  // 2. Sort by source file name desc, flatten and keep order within each file
  const sortedFiles = [...memoPosts].sort((a, b) =>
    a.file_path < b.file_path ? 1 : -1,
  );
  const allMemos = sortedFiles.flatMap((file) => file.memos);

  // 3. Pagination: update csrIndex [page, indexInPage]
  allMemos.forEach((memo, index) => {
    memo.csrIndex = [Math.floor(index / PAGE_SIZE), index % PAGE_SIZE];
  });

  const pageCount = Math.ceil(allMemos.length / PAGE_SIZE);
  // 4. Build auxiliary data
  const tags = buildTags(allMemos);
  const imgs = allMemos.filter((m) => m.imgs_md.length > 0);
  const info: MemoInfo = {
    memos: allMemos.length,
    tags: tags.length,
    imgs: imgs.length,
    pages: Math.ceil(allMemos.length / PAGE_SIZE),
  };

  // 5-pre. Compile Memopost.content into JSX.
  // Modify content in place.
  const compiled: MemoPostJsx[] = await Promise.all(
    allMemos.map(async (memo) => {
      const { content, ...rest } = memo;
      return {
        ...rest,
        content_jsx: await toMdxCode(content, {
          remarkPlugins: [remarkGfm, remarkTag],
          rehypePlugins: [rehypeHighlight],
        }).then((res) => res.code),
      };
    }),
  );

  // 5. Write paged json files
  for (let page = 0; page < pageCount; page++) {
    const pageMemos = compiled.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    await writeJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`), pageMemos);
  }

  // 6. Write other CSR files
  await Promise.all([
    writeJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE), info),
    writeJson(path.join(MEMO_CSR_DATA_DIR, "tags.json"), tags),
    writeJson(path.join(MEMO_CSR_DATA_DIR, "imgs.json"), imgs),
  ]);

  console.log(
    `[memos.ts] Built CSR data: ${allMemos.length} memos, ${pageCount} pages`,
  );
}

/**
 * Build MemoTag[] from all memos
 */
function buildTags(memos: MemoPost[]): MemoTag[] {
  const tagMap = new Map<string, string[]>();

  for (const memo of memos) {
    for (const tag of memo.tags) {
      const ids = tagMap.get(tag);
      if (ids) {
        ids.push(memo.id);
      } else {
        tagMap.set(tag, [memo.id]);
      }
    }
  }

  return Array.from(tagMap.entries()).map(([name, memoIds]) => ({
    name,
    memoIds,
  }));
}

/**
 *  return "[tag1,tag2]"
 */
function extractTagsFromMarkdown(markdown: string) {
  const title = ["#", "##", "###", "####", "#####", "######"];
  const tags: string[] = [];
  let tmp = "";
  let ignore = false;

  for (let i = 0; i < markdown.length; i++) {
    const v = markdown[i];

    // ignore in code
    if (v === "`") {
      ignore = !ignore;
      if (ignore) tmp = ``;
    }

    if (!ignore) {
      if (tmp.length > 0) {
        // when in tag
        if (v === " " || v === "\n" || v === "\r\n") {
          if (!title.includes(tmp)) {
            tags.push(tmp.slice(1));
          }
          tmp = "";
        } else {
          tmp += v;
        }
      } else if (
        v === "#" &&
        (i === 0 || markdown[i - 1] === " " || markdown[i - 1] === "\n")
      ) {
        // detect tag start
        tmp += v;
      }
    }
  }

  if (tmp.length > 0) tags.push(tmp.slice(1));

  return tags;
}
