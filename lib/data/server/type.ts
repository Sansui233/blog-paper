import type { MemoInfo } from "../memos.common"

export interface MemoInfoExt extends MemoInfo {
  pages: number,
  fileMap: MemoFileMap[],
  pageMap: MemoPageMap[],
}
export type MemoFileMap = {
  srcName: string,
  lastModified: number,
  dateRange: {
    start: string,
    end: string
  },
  startAt: {
    page: number,
    index: number,
  },
  endAt: {
    page: number,
    index: number,
  }
}
export type MemoPageMap = {
  page: number,
  startDate: number;
  endDate: number;
}