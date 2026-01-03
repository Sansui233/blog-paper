import type { MemoInfo } from "../memos.common";

export interface MemoInfoExt extends MemoInfo {
  pageMap: MemoPageMap[],
}
export type MemoPageMap = {
  page: number,
  startDate: number;
  endDate: number;
}