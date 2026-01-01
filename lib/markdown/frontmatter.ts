import matter from "gray-matter";
import { PostMeta } from "../data/posts.common";
import { dateToYMDMM } from "../date";

export function grayMatter2PostMeta(fm: matter.GrayMatterFile<string>): PostMeta {
  // 容错处理
  if (fm.data["tags"] && typeof fm.data["tags"] === "string") {
    fm.data["tags"] = fm.data["tags"].split(/,|，/g).filter(t => t !== "")
  } else if (!fm.data["tags"]) {
    fm.data["tags"] = []
  }

  if (fm.data["date"] && fm.data["date"] instanceof Date) {
    fm.data["date"] = dateToYMDMM(fm.data["date"])
  }

  return {
    title: "",
    date: "",
    tags: [],
    categories: "",
    ...fm.data,
  }
}