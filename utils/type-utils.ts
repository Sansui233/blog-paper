export type Extend<T extends object> = {
  [K in keyof T]: T[K]
} & {
  [name: string]: any
}

// 选中的 key 移除可选，没选中的保持原样
export type RequiredByKeys<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;