import { Extend } from "../../../utils/type-utils";
import { MemoInfo, MemoPost, MemoTag } from "../memos.common";
import StaticClient from "./static";

export interface Client {
  getMemoInfo: () => Promise<Extend<MemoInfo>>
  queryMemoByCount: (start: number, len: number) => Promise<MemoPost[]>
  queryMemoByDate: (latest: Date, oldest: Date) => Promise<MemoPost[]>
  queryMemoTags: (start: Date, end: Date) => Promise<MemoTag[]>
  queryMemoImgs: (start: Date, end: Date) => Promise<MemoPost[]>
}

/**
 * name: Client
 */
export const clientList = {
  static: StaticClient
} as const

export function createClient(name: keyof typeof clientList) {
  if (!clientList[name]) console.error(`[client.ts] client ${name} not in clientList`)
  return clientList[name]
}