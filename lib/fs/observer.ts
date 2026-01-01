/**
 * Monitoring if file in an directory has been modified or not
*/

import fs from "fs";
import path from "path";
import { getStat, loadJson, writeJson } from "./fs";
import { DirInfo, FileInfo } from "./obeserver.common";

/**
 * 
 * use an infoFile to observe directory
 * @param dir directory to be observed
 * @param infoPath a full path where the status stored
 * @param isIdentical a callback that returns the comparison method
 * @param handleInfo Update file Info for new files and write
 * @param filter a string that file name contains
 * @returns modifed-file list
 */
export async function observe<U extends FileInfo>(
  dir: string,
  infoPath: string,
  isIdentical: (oldstatus: U, newstatus: fs.Stats) => boolean,
  handleInfo?: (info: FileInfo) => U,
  filter?: string,
) {

  // read old status
  let oldInfo = (await loadJson(infoPath)) as DirInfo<U>

  // filter new files and sort
  let fileNames = await fs.promises.readdir(dir)
  if (filter) {
    fileNames = fileNames.filter(f => {
      return f.includes(filter)
    })
  }

  fileNames = fileNames.sort((a, b) => {
    return a < b ? -1 : 1
  })

  // res
  const list = {
    mod: new Array<string>(),
    del: new Array<string>(),
    create: new Array<string>()
  }
  const newInfo: DirInfo<FileInfo> = {
    fileMap: new Array<FileInfo>()
  }

  // 经典的双链表排序问题
  // 读 oldInfo 和 filenames，按排序后的名字比较
  let i = 0, j = 0;
  if (oldInfo) {
    const fileMap = oldInfo.fileMap.sort((a, b) => {
      return a.name < b.name ? -1 : 1;
    })

    // console.debug('[observer.ts] old file list', fileMap.map(p => p.name))
    // console.debug('[observer.ts] new file list', fileNames)

    while (i < fileMap.length && j < fileNames.length) {
      const oldfile = fileMap[i].name
      const oldstat = fileMap[i]
      const newfile = fileNames[j]
      const newstat = await (getStat(path.join(dir, newfile)));

      if (!newstat) {
        console.error(`[observer.ts] unexpected ${newstat} not found`)
        j++;
        continue // TODO throw error
      }
      const finfo = {
        name: newfile,
        mtime: newstat ? newstat.mtime.getTime() : -1
      }
      if (handleInfo) {
        const u = handleInfo(finfo)
        newInfo.fileMap.push(u)
      } else {
        newInfo.fileMap.push(finfo)
      }


      if (oldfile < newfile) {
        list.del.push(oldfile);
        i++;
        continue;
      }

      if (oldfile === newfile) {
        const res = isIdentical(oldstat, newstat)
        if (!res) {
          list.mod.push(oldfile);
        }
        i++; j++;
        continue;
      }

      if (oldfile > newfile) {
        list.create.push(newfile);
        j++;
        continue;
      }

    }

    // tail
    while (i < fileMap.length) {
      list.del.push(fileMap[i].name)
      i++
    }
    while (j < fileNames.length) {
      const newfile = fileNames[j]
      const newstat = await (getStat(path.join(dir, newfile)));
      const finfo = {
        name: newfile,
        mtime: newstat ? newstat.mtime.getTime() : -1
      }
      if (handleInfo) {
        const u = handleInfo(finfo)
        newInfo.fileMap.push(u)
      } else {
        newInfo.fileMap.push(finfo)
      }
      list.create.push(fileNames[j])
      j++
    }

  } else {
    await Promise.all(fileNames.map(async newfile => {
      const newstat = await (getStat(path.join(dir, newfile)));
      const finfo = {
        name: newfile,
        mtime: newstat ? newstat.mtime.getTime() : -1
      }
      if (handleInfo) {
        const u = handleInfo(finfo)
        newInfo.fileMap.push(u)
      } else {
        newInfo.fileMap.push(finfo)
      }

      list.create.push(newfile);
    }))
  }

  if (handleInfo) {
    writeJson(infoPath, newInfo)
  }

  // console.debug(`[observer.ts] modified list`, list)

  return list
}