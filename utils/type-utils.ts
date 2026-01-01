export type Extend<T extends object> = {
  [K in keyof T]: T[K]
} & {
  [name: string]: any
}