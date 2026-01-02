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
  id: string; // Heading2 title
  content: string;
  tags: string[];
  imgs_md: string[];
  sourceFile: string;
  csrIndex: [number, number]; // page index
};


export type MemoTag = {
  name: string,
  memoIds: string[]
}
