# blog-paper

一个黑白简约风格的个人博客，兼具微博客功能。保留了原来 hexo 博客用法的简便性。

- 效果：https://sansui233.com

![2025-02-13](https://cdn.jsdelivr.net/gh/NamiLing/upic/picgo/202502140017014.webp)

## 特点

- 传统静态博客版块，与 hexo 兼容
- 静态的微博客版块，告别长文负担
- 支持自动亮暗模式
- 支持站内搜索
- 支持rss订阅

## 需要准备

- NodeJS 环境
- 评论系统：依赖于 [Waline](https://waline.js.org)。不是必须的
- 站点分析： 依赖于 Google Analystics，不是必须的

## 配置

首先下载此仓库

```sh
git clone --depth=1 https://github.com/Sansui233/next-blog-paper.git
```

### 1. 站点配置文件

在工作目录下添加`site.config.js`。

```js
export const siteInfo = {
  author: "Sansui", // 作者名
  social: {
    email: "sansuilnm@gmail.com", // 邮件
    github: "https://github.com/sansui233" // github 链接
  },
  // Sites
  domain: "https://sansui233.com", // rss 中显示的域名。不影响实际部署
  walineApi: serverAPI, // 可选项，Waline 评论系统后端地址。不需要请删除。
  GAId: "G-xxxxxx", // 可选项，可留空。Google Analytics id。不需要请删除。
}
```


由于还在开发中，其他地方目前是写死配置，需要自行改动。

### 2. 站点静态资源

放在 `public/` 目录下。

- `favicon.ico` 网页小图标，浏览器用。可使用 favicon 生成工具制作。
- `avatar-white.png` `avatar-black.png` 作者头像，分为白天模式头像与夜间模式头像。
- `imgs/bg.jpg` "关于我" 页面使用的头图。


### 3. 博客文章

放在 `source/posts/` 目录的所有 markdown 文件为博客文章。具体见 [source/posts](https://github.com/Sansui233/blog/tree/master/source/posts) 中的示例。

最简格式：

```
---
title: 我是标题
date: 2016-03-24 19:23:17
categories: 其他
---

正文内容

```

完整格式

```
---
title: Markdown 测试
date: 2023-08-30 02:54:34
categories: 其他
tags: 
  - blog
  - othetag
description: 测试 draft 属性
draft: true
keywords: Markdown, 测试
---

正文内容

```

- `description` 文章简短描述，出现在首页，也用于补充 seo 信息。
- `draft` 是否为草稿，目前不出现在网页，用于控制是否通过 rss 发布。
- `keywords` 关键词，目前不出现在网页，用于 seo。

### 4. 微博客文章(memo)

特性:

- 无后端，全静态的本地 markdown
- 支持正文内的标签解析（类似推特）
- 收集图片信息单独展示

放在 `source/memos/` 目录的所有 markdown 文件为 memo 文章。具体见 [source/memos](https://github.com/Sansui233/blog/tree/master/source/memos) 中的示例。


- 文章中的每个二级标题生成一个memo。二级标题名需需要保证唯一性。请尽量使用时间戳，如`2023-08-30 02:54:34`。
- 只需要一个文件存储就行，也可以分多个文件存储。文件名越大展示越靠前。
- rss 会在最大文件的 yaml头 更改时生成，仅抓取最近6条。

### 5. “关于我”页面

在 `pages/about.tsx` 手动写的内容。这是唯一的作者页面，请尝试大胆改造吧。

（由于此页面格式不可复用，因此没有用 markdown 生成）

## 构建博客


```sh
$ npm build # 构建，导出静态页面到 out 文件夹
$ npm start # 启动服务
```

## 部署

参考 [deploy.sh](https://github.com/Sansui233/next-blog-paper/blob/master/deploy.sh)，上传 out 文件夹的内容到 gitpages。需要修改脚本中的目标文件夹和 git push 的分支名。

我个人使用的是 github pages，同时 vercel 拉取 github 的分支。

## Progress

- [ ] 基本框架完成
- [ ] rss 完成
- [ ] Dark Mode
- [ ] 详细分类页
- [ ] 分页渲染
- [ ] 评论接入
- [ ] 统计接入
- [ ] 站内搜索
- [ ] 增加微博客内容(相册等)
- [ ] UI语言切换
- [ ] mdx 支持性测试


## Thanks

- 框架：React Router 7
- MDX parser: next-mdx-remote
- CSS 方案: tailwind css
- 评论系统: [Waline](https://waline.js.org)
- 统计数据: Google Analytics
- 图标: lucide
- 部署: github, vercel

