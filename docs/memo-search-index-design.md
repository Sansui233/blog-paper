## 构建时机

参与 Velite 最后的 build。

## 输入

velite 的 data.memos，有 元数据和 content 字段

## 搜索预期

由于 Memo 不需要相关性排序，所以搜索结果按 SourceFile 倒序排就好了。

对于任意 query，先搜索 tags 字段。然后搜索 RAWContent。

这里有个问题是，搜索使用的是 raw，但渲染要 jsx code 结果。有两种方向

- 索引只包含 raw。优点减少索引的体积，缺点只能使用客户端渲染，见 md-compile 文件，要打包 mdx-js 的 compile 部分。
- 索引包含以上两者。缺点增加索引的体积，优点打包 mdx-js 的 compile 部分

鉴于博客的字会越来越多，打算使用客户端渲染。因此，索引Content 传输原始的 Markdown。

引擎因为只涉及Tag与字符串的匹配，直接使用内置手撮的 Naive。~~尽管有 Bug 但无所谓了~~


## 索引

Memo Item 索引：
- id: string（通常为 date 格式 2026-01-03 23:29:02）
- tags: string[]
- content: string

### 近期索引（默认）
生成`memo-search-index.json`：最近的100条 Memo 和所有带有 Tag 的 Memo。

- 客户端路径：`/data/memo-search-index.json`
- 服务端路径：`public/data/memo-search-index.json` 

### 全部索引

懒得做。其实就是在近期索引的基础上，把 memo-limit 设置为 null 就好了。

### 月份索引

懒得做。

另外，我是不建议去拓展单个索引文件当 db，然后增加搜索引擎的能力。首先是对于静态博客，都需要一次性传输全部数据，其次是，一直改索引格式和改搜索方式，容易屎山。把文件预分割成小块加载没什么问题，也就是 build 时间更长一点。

## 文件

- 索引类型文件： `lib/data/search.common.ts`
- 生成索引： `lib/data/server/searchindex.ts`
- velite: `velite.config.ts`


