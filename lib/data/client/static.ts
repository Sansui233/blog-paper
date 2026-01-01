import { Client } from ".";
import { INFOFILE, MemoPost, MemoTag } from "../memos.common";
import { MemoInfoExt } from "../server/type";



// Client for internal SSR/SSG

const MemoCSRAPI = '/data/memos'

const getMemoInfo: Client['getMemoInfo'] = async (): Promise<MemoInfoExt> => {
  return fetch(MemoCSRAPI + "/" + INFOFILE)
  .then( res => res.json() as Promise<MemoInfoExt>)
  .then( data => { return data })
}

const queryMemoByCount: Client['queryMemoByCount'] = async (start, len) => {
  // index [page, item_number]
  const pageStart = [Math.floor(start/10),start % 10] // 10 memos per page on serverside
  const pageEnd = [Math.floor((start+len-1)/10), (start+len-1)%10] // 右闭区间以便于处理边界情况

  const info = (await getMemoInfo()) as MemoInfoExt
  
  const urls : string[]  = [];
  for(let i = pageStart[0]; i <= pageEnd[0]; i++){
    if(i >= 0 && i <= info.pages ){ // 额,最大 pages 其实是最大 index
      urls.push(`${MemoCSRAPI}/${i}.json`)
    }
  }
  const promises:Promise<MemoPost[]>[] = urls.map(async (url, i) => {
    return fetch(url)
    .then( res =>  res.json() as Promise<MemoPost[]>)
    .then( data => {
      if(i === 0){
        if(pageEnd[0] - pageStart[0] !== 0){
          return data.slice(pageStart[1])
        }else{
          return data.slice(pageStart[1], pageEnd[1]+1)
        }
      }else if( i === pageEnd[0]){
        return data.slice(0, pageEnd[1]+1)
      }else{
        return data
      }
    })
  })

  return (await Promise.all(promises)).flat()
}

// TODO 还没有做精确分割，用起来可能会有 bug
const queryMemoByDate: Client['queryMemoByDate'] = async (latest, oldest)=>{
  const info = (await getMemoInfo()) as MemoInfoExt
  const pages = info.pageMap.filter( page => {
    if(page.endDate < latest.getTime()) return false
    if(page.startDate > oldest.getTime()) return false
  })
  const urls = pages.map(i => `${MemoCSRAPI}/${i}.json`)
  const promises:Promise<MemoPost[]>[] = urls.map(async (url, i) => {
    return fetch(url)
    .then( res =>  res.json() as Promise<MemoPost[]>)
    .then( data => data )
  })

  return (await Promise.all(promises)).flat()
}

const queryMemoTags: Client['queryMemoTags'] = async () => {
  return fetch(`${MemoCSRAPI}/tags.json`)
  .then( res => res.json() as Promise<MemoTag[]>)
}

const queryMemoImgs: Client['queryMemoImgs'] = async () => {
  return [] // TODO
}

const StaticClient: Client =  {
  getMemoInfo,
  queryMemoByCount,
  queryMemoByDate,
  queryMemoTags,
  queryMemoImgs,
}

export default StaticClient