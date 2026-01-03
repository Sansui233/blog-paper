import { throttle } from "../throttle";
import type { Engine, Match, Result, SearchObj } from "./common";
import stopwords from "./stopwords/zh.json";

/**
 * Config for creating a Naive search engine
 *
 * @template T - The search object type (must extend SearchObj with at least `id`)
 * @template R - The result type (must extend Result with `id` and `matches`)
 */
interface Config<T extends SearchObj, R extends Result> {
  /** Data to search in */
  data: T[]
  /** Fields to search (must be string fields in T, except 'tags' which is string[]) */
  field: Array<keyof T>
  /** Callback when results are ready */
  notifier: (res: R[]) => void
  /** Disable throttled streaming notifications */
  disableStreamNotify?: boolean
  /**
   * Build a result object from the source object and matches.
   * This function determines what fields are included in the result.
   *
   * @example
   * // Return only id and matches (minimal)
   * buildResult: (obj, matches) => ({ id: obj.id, matches })
   *
   * @example
   * // Include title from source object
   * buildResult: (obj, matches) => ({ id: obj.id, title: obj.title, matches })
   */
  buildResult: (obj: T, matches: Match[]) => R
}

export interface Naive extends Engine { }

export function createNaive<T extends SearchObj, R extends Result>(conf: Config<T, R>): Naive {

  const tasks: Promise<void>[] = []
  const res: R[] = []
  const throttledNotify = conf.disableStreamNotify ? undefined : throttle(conf.notifier, 125)

  /**
   * Find if all strings in an array are in a search Object
   * 以 SearchObj为粒度的搜索
   *
   * 目前的实现非跨field搜索，也就是如果有多个关键词，需要同在一个 field 中出现
   *
   * 关键词之间为连续匹配的 And 逻辑，但不完全，会 Partial match 靠前的词
   * 比如可以匹配到 [p1] [p1, p2] [p1, p2, p3]，越靠前的关键词越重要
   * 不能匹配到 [p2] [p2, p3], 至于 [p1, p3] 相当于 [p1]
   * 是由 _match 的 break 时机控制的。目的是在保证结果可用的情况下，尽量减少匹配次数
   *
   * tag 除外，特殊机制，全匹配
   *
   * 最后外面的结果排序是按关键词个数来的
   *
   * 结果存入 res
   */
  const find = (patterns: string[], o: T) => {
    return new Promise<void>(resolve => {

      // Iterate Field
      for (let j = 0; j < conf.field.length; j++) {

        const f = conf.field[j]

        // if field not in SearchObject properties, skip
        if (!(f in o)) {
          continue
        }

        if (f === "tags") {
          const tags = o[f] as string[] | undefined
          if (!tags) continue

          const input_tags = patterns.filter(p => p[0] === "#").map(t => t.slice(1))
          const matched_tags = tags.filter(t => input_tags.includes(t))

          if (matched_tags.length > 0) {
            const matches: Match[] = matched_tags.map(t => ({ word: t }))
            res.push(conf.buildResult(o, matches))
            break
          } else {
            continue
          }
        } else {
          const fieldValue = o[f]
          if (typeof fieldValue !== 'string') continue

          // search in lower case mode
          const indexs = _match(fieldValue.toLowerCase(), patterns.map(p => p.toLowerCase()))

          // build result
          if (indexs.length !== 0) {
            const matches: Match[] = indexs.map(i => {
              const start = Math.max(0, i.index - 10)
              const end = Math.min(fieldValue.length, i.index + 40)

              return {
                word: i.word,
                excerpt: f !== "title" ? fieldValue.slice(start, end).replaceAll("\n", "") : undefined
              }
            })

            res.push(conf.buildResult(o, matches))
            break // 在任何一个域中找全就停止field search
          }
        }

      }

      // Notify observer
      if (res.length !== 0 && throttledNotify) {
        throttledNotify([...res])
      }
      resolve();

    });
  }

  const _tasks_add = (patterns: string[]) => {
    conf.data.forEach((o) => {
      tasks.push(find(patterns, o))
    })
  }

  const _clear = () => {
    tasks.splice(0)
    res.splice(0)
  }

  const search = async (patterns: string[]) => {
    patterns = patterns.map(s => s.trim()).filter(v => v !== "")
    if (patterns.length === 0) {
      conf.notifier([])
      return
    }

    _tasks_add(patterns)
    await Promise.all(tasks)

    // Sort by match count (more matches = higher rank)
    if (res.length > 1) {
      res.sort((a, b) => b.matches.length - a.matches.length)
    }

    conf.notifier([...res])
    _clear()
  }

  return { search }
}


/**
 * find all pattern locations in string s
 *
 * matches is AND
 */
const _match = (s: string, patterns: string[]): {
  word: string,
  index: number,
}[] => {

  const res: { word: string, index: number }[] = []

  for (const p of patterns) {
    if (stopwords.includes(p)) {
      break
    }

    if (!/^[A-Za-z]+$/.test(p)) {
      // 带中文直接返回，分词在浏览器没法
      const index = s.indexOf(p)
      if (index !== -1) {
        res.push({ word: p, index: index })
      } else {
        break // once pattern match fails then return false
      }
    } else {
      // English with word split
      const reg = new RegExp(`\\b${p}\\b`, 'i');
      const match = reg.exec(s);
      if (match) {
        res.push({ word: p, index: match.index })
      } else {
        break  // once pattern match fails then return false
      }
    }
  }

  return res;
}