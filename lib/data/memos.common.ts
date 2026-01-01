/**
 * This file is for the type def of const var for Both SSR and CSR Usage
 */

export interface MemoInfo {
  memos: number,
  tags: number,
  imgs: number,
}


export const INFOFILE = "status.json"

export interface MemoPost {
  id: string;
  content: string;
  tags: string[];
  imgsmd: string[];
  sourceFile: string;
  csrIndex: [number, number]; // page index
};


export type MemoTag = {
  name: string,
  memoIds: string[]
}
