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

/**
 * Per-search configuration options
 */
export interface SearchConfig<T extends SearchObj = SearchObj> {
  /**
   * Fields to search in this specific search call.
   * Must be a subset of the fields defined in engine Config.
   * If empty or undefined, uses all fields from engine Config.
   */
  fields?: Array<keyof T>
}

/**
 * Base engine interface
 */
export interface Engine<T extends SearchObj = SearchObj> {
  search: (patterns: string[], config?: SearchConfig<T>) => unknown
}