import { createNaive, type Match, type Naive, type Result, type SearchConfig, type SearchObj } from 'lib/search'
import React, { useCallback, useState } from 'react'

export type SearchStatus = {
  isSearch: "ready" | "searching" | "done",
  searchText: string,
}

/**
 * Parsed search query result
 */
interface ParsedQuery<T extends SearchObj> {
  patterns: string[]
  config?: SearchConfig<T>
}

/**
 * Parse search query string with field syntax support
 *
 * Syntax:
 * - `field:pattern1,pattern2` - search specific field with patterns
 * - `pattern1 pattern2` - search all fields with patterns
 *
 * Pattern separators: space, comma, period (，、。,.)
 *
 * Examples:
 * - "tags:react,vue" → patterns: ["react", "vue"], fields: ["tags"]
 * - "title:hello world" → patterns: ["hello", "world"], fields: ["title"]
 * - "hello world" → patterns: ["hello", "world"], fields: undefined (all)
 * - "tags:react hello" → patterns: ["react", "hello"], fields: ["tags"] (field applies to first part only)
 */
export function parseSearchQuery<T extends SearchObj>(query: string): ParsedQuery<T> {
  const trimmed = query.trim()
  if (!trimmed) {
    return { patterns: [] } satisfies ParsedQuery<T>
  }

  // Pattern separators: space, comma, period (both Chinese and English)
  const separatorRegex = /[\s,，.。、]+/

  // Check for field prefix syntax: "field:patterns"
  const fieldMatch = trimmed.match(/^(\w+):(.*)$/)

  if (fieldMatch) {
    const [, fieldName, rest] = fieldMatch
    // Split remaining text by separators
    const patterns = rest
      .split(separatorRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    return {
      patterns,
      config: {
        fields: [fieldName as keyof T]
      } satisfies SearchConfig<T>,
    }
  }

  // No field prefix - split by separators and search all fields
  const patterns = trimmed
    .split(separatorRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  return { patterns }
}

type Props<T extends SearchObj, R extends Result> = {
  /**
   * html input element reference
   */
  inputRef: React.RefObject<HTMLInputElement | null>,
  /**
   * once search is done, the engine call this function with search result in argument.
   */
  setRes: React.Dispatch<React.SetStateAction<R[]>>
  /**
   * configure source data and result builder
   */
  initData: () => Promise<{
    /** Search data source */
    data: T[]
    /** Fields to search in */
    fields: Array<keyof T>
    /** Build result object from source object and matches */
    buildResult: (obj: T, matches: Match[]) => R
  }>
}

/**
 * Here are 3 ways to use search:
 *
 * 1. `setTextAndSearch(str, true)` This will put search text into your inputRef and automatically init search engine and doing search
 * 2. `search()` This will init search engine and do search according to the content in your inputRef
 *
 * If you want init search engine on your demand, you can use `initSearch()`
 *
 */
function useSearch<T extends SearchObj, R extends Result>({
  inputRef,
  setRes,
  initData
}: Props<T, R>): {
  searchStatus: SearchStatus;
  resetSearchStatus: () => void;
  /**  put text into input ref element and call search */
  setTextAndSearch: (text: string, immediateSearch?: boolean, config?: SearchConfig<T>) => void
  /** instant search with input ref content*/
  search: (config?: SearchConfig<T>) => Promise<void>
  initSearch: () => Promise<Naive<T>>
} {
  const [engine, setEngine] = useState<Naive<T>>()
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({
    isSearch: "ready",
    searchText: "",
  })

  /**
   * init search engine when you want.
   *
   * this will execute initData() which may take long time on first time
   * or search engine will automatically init on first search
   */
  const initSearch = useCallback(async () => {

    if (engine) return engine

    console.log("init search...")
    const { data, fields, buildResult } = await initData()

    function notifier(results: R[]) {
      setRes(results)
      setsearchStatus(status => ({
        ...status,
        isSearch: "done",
      }))
    }

    const newEngine = createNaive<T, R>({
      data,
      field: fields,
      notifier,
      disableStreamNotify: true,
      buildResult,
    })

    setEngine(newEngine)
    setsearchStatus(status => {
      return { ...status, }
    })

    return newEngine
  }, [initData, setRes, engine])

  /**
   * start search according to the text in the input ref element
   */
  const search = useCallback(async (configOverride?: SearchConfig<T>) => {
    if (!inputRef?.current) return
    const str = inputRef.current.value.trim()
    if (str.length === 0) return

    setsearchStatus(status => ({
      ...status,
      isSearch: "searching",
      searchText: str
    }))
    globalThis.scrollTo({ top: 0 })

    let e = engine
    if (!e) {
      e = await initSearch() // init search engine && get data
    }

    // Parse query with field syntax support
    const { patterns, config: parsedConfig } = parseSearchQuery<T>(str)

    if (patterns.length === 0) {
      setsearchStatus(status => ({ ...status, isSearch: "done" }))
      return
    }

    // configOverride takes precedence over parsed config
    const finalConfig = configOverride ?? parsedConfig
    e.search(patterns, finalConfig)

  }, [initSearch, engine, inputRef])

  /**
   * put text into input ref element and (optinal) search immediately.
   */
  const setTextAndSearch = useCallback((text: string, immediateSearch = true, config?: SearchConfig<T>) => {
    if (!inputRef.current) return

    inputRef.current.value = text
    if (immediateSearch) {
      search(config)
    }
  }, [search, inputRef])

  const resetSearchStatus = useCallback(() => {
    setsearchStatus(() => {
      return {
        isSearch: "ready",
        searchText: ""
      }
    })
  }, [])

  return {
    searchStatus,
    resetSearchStatus,
    setTextAndSearch,
    search,
    initSearch,
  }
}

export default useSearch