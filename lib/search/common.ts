export interface SearchObj {
  id: string,
  title: string,
  content: string,
  tags?: string[],
  description?: string,
  keywords?: string,
  date?: string
}

export interface Result {
  id: string
  title?: string
  matches?: {
    word: string,
    excerpt?: string,
  }[]
}

export interface Engine {
  search: (s: string[])=>unknown
}


