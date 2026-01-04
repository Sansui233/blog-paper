import { throttle } from "../throttle";
import type { Engine, Match, Result, SearchConfig, SearchObj } from "./common";

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

export interface Naive<T extends SearchObj = SearchObj> extends Engine<T> {
  search: (patterns: string[], config?: SearchConfig<T>) => Promise<void>
}

export function createNaive<T extends SearchObj, R extends Result>(engineConf: Config<T, R>): Naive<T> {

  const throttledNotify = engineConf.disableStreamNotify ? undefined : throttle(engineConf.notifier, 125)

  /**
   * find all pattern locations in string s
   * matches is AND
   */
  const matchPatterns = (s: string, patterns: string[]): { word: string; index: number }[] => {
    const res: { word: string; index: number }[] = []

    for (const p of patterns) {
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
          break // once pattern match fails then return false
        }
      }
    }

    return res
  }

  /**
   * Find if all strings in an array are in a search Object
   * 以 SearchObj为粒度的搜索
   *
   * 目前的实现非跨field搜索，也就是如果有多个关键词，需要同在一个 field 中出现
   *
   * 关键词之间为连续匹配的 And 逻辑，但不完全，会 Partial match 靠前的词
   * 比如可以匹配到 [p1] [p1, p2] [p1, p2, p3]，越靠前的关键词越重要
   * 不能匹配到 [p2] [p2, p3], 至于 [p1, p3] 相当于 [p1]
   * 是由 matchPatterns 的 break 时机控制的。目的是在保证结果可用的情况下，尽量减少匹配次数
   *
   * tag 除外，特殊机制，全匹配
   *
   * 最后外面的结果排序是按关键词个数来的
   */
  const findInObject = (patterns: string[], obj: T, fields: Array<keyof T>): R | null => {
    for (const field of fields) {
      if (!(field in obj)) continue

      

      if (field === "tags") {
        const tags = obj[field] as string[] | undefined
        if (!tags) continue

        const matched_tags = tags.filter(t => patterns.includes(t))
        
        if (matched_tags.length > 0) {
          const matches = matched_tags.map(t => ({ word: t })) satisfies Match[]
          return engineConf.buildResult(obj, matches)
        }
      } else {
        // other string fields
        const fieldValue = obj[field]
        if (typeof fieldValue !== 'string') continue

        // search in lower case mode
        const indexs = matchPatterns(fieldValue.toLowerCase(), patterns.map(p => p.toLowerCase()))

        // build result
        if (indexs.length !== 0) {
          const matches = indexs.map(i => {
            const start = Math.max(0, i.index - 10)
            const end = Math.min(fieldValue.length, i.index + 40)

            return {
              word: i.word,
              excerpt: field !== "title" ? fieldValue.slice(start, end).replaceAll("\n", "") : undefined
            } satisfies Match
          })

          return engineConf.buildResult(obj, matches)
        }
      }
    }

    return null
  }

  /**
   * Resolve search fields from SearchConfig
   * Returns narrowed fields if valid subset provided, otherwise returns all configured fields
   */
  const resolveFields = (config?: SearchConfig<T>): Array<keyof T> => {
    if (!config?.fields || config.fields.length === 0) {
      return engineConf.field
    }

    // Validate that all requested fields are in the configured fields
    const validFields = config.fields.filter(f => engineConf.field.includes(f))
    return validFields.length > 0 ? validFields : engineConf.field
  }

  /**
   * Main search function
   */
  const search = async (patterns: string[], config?: SearchConfig<T>): Promise<void> => {
    // Normalize patterns
    patterns = patterns.map(s => s.trim()).filter(v => v !== "")
    if (patterns.length === 0) {
      engineConf.notifier([])
      return
    }

    const fields = resolveFields(config)

    const results: R[] = []

    // Create search tasks
    const tasks = engineConf.data.map(obj => {
      return new Promise<void>(resolve => {
        const result = findInObject(patterns, obj, fields)
        if (result) {
          results.push(result)
          // Stream notify if enabled
          if (throttledNotify) {
            throttledNotify([...results])
          }
        }
        resolve()
      })
    })

    await Promise.all(tasks)

    // Sort by match count (more matches = higher rank)
    if (results.length > 1) {
      results.sort((a, b) => b.matches.length - a.matches.length)
    }

    engineConf.notifier([...results])
  }

  return { search }
}
