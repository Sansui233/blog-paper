export interface FileInfo {
  name: string,
  mtime: number,
  md5?: string,
}

export interface DirInfo<U extends FileInfo> {
  fileMap: Array<U>
}