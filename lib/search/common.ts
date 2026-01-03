/**
 * Base search object interface - user's data must have at least `id`
 */
export interface SearchObj {
  id: string
  tags?: string[]
  [key: string]: unknown
}

/**
 * Match info produced by the search engine
 */
export interface Match {
  word: string
  excerpt?: string
}

/**
 * Base result interface - all results have id and matches
 */
export interface Result {
  id: string
  matches: Match[]
}

export interface Engine {
  search: (s: string[]) => unknown
}