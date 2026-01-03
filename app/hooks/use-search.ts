import { createNaive, type Match, type Naive, type Result, type SearchObj } from 'lib/search'
import React, { useCallback, useState } from 'react'

export type SearchStatus = {
  isSearch: "ready" | "searching" | "done",
  searchText: string,
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
 * Here are 2 ways to use search:
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
  setTextAndSearch: (text: string, immediateSearch?: boolean) => void // put text into input ref element and (optinal) search immediately.
  /** instant search with input ref content*/
  search: () => Promise<void>
  initSearch: () => Promise<Naive>
} {
  const [engine, setEngine] = useState<Naive>()
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
  const search = useCallback(async () => {
    if (!inputRef.current) return
    const str = inputRef.current.value.trim()
    if (str.length === 0) return

    setsearchStatus(status => ({
      ...status,
      isSearch: "searching",
      searchText: str // possibly the search text is stale
    }))
    globalThis.scrollTo({ top: 0 })

    let e = engine
    if (!e) {
      e = await initSearch() // init search engine && get data
    }
    e.search(str.split(" "))

  }, [initSearch, engine, inputRef])

  /**
   * put text into input ref element and (optinal) search immediately.
   */
  const setTextAndSearch = useCallback((text: string, immediateSearch = true) => {
    if (!inputRef.current) return

    inputRef.current.value = text
    if (immediateSearch) {
      search()
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
    search, // 
    initSearch,
  }
}

export default useSearch