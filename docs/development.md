## 开发环境

**编辑器：Vscode**

- prettier 插件
- tailwind 插件和项目配置（.vscode/settings.json）

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```
- tailwind fold 插件

**书写工具**

- Obsidian：有模板，quick add 插件绑到 Dataview 页面的按钮上，有相当于 Notion 的模板体验
- Typora：Memo专用，很有吐槽欲望）

**包管理器：pnpm**

## Overall

见 CLAUDE.md

主要组件
- Home 页面，分类栏，顶部搜索
- Post 页面：正文，翻页，边栏（目录），评论。Img
- Memo 页面：
  - 虚拟列表，边栏，评论 Modal
  - Img 浏览器（各种比例的图片支持）
  - 客户端搜索与路由跳转
- About 页面
- 标签和分类页面，其中 All Post，相当于以前的 Archive。时间线布局说实话比主页好看，但不太像主页，好看归好看，信息少了其实没什么探索欲。

## 坑

- VirtualList 为单向增长的虚拟列表（其实可以支持双向但是 Height 数组和 Indices 要重新映射）。并且注意派生状态的坑。要么数据全部自己接管为State，要么全部由父级直接控制，而且千万不要在把父级 State 和父级 Props 混合传入，特别是父级有 useEffect 时，容易造成反模式有潜在的 Bug。Debug 过一次就老实了。
- 所有图片都不知道宽高和大小，因此不适合做一页超多的图片显示。上传图床时注意优化大小。另外虽然 velite 可以处理 assets，好处是本地的图可以有缩略图，反正图片本地和云端都得选一个地方放，我觉得自己提前上传比较好。但是 Memo 的相册我可能会考虑一下用本地的图。
- tailwind 真的是好用且 ugly
- claude 真的是好用，但总感觉开发过程变成了修 bug 过程，痛苦
- React Router 7 也是真的好用，再也不用管 Next.js 约定的那套像祖宗之法不可违背的路由系统了，我 free 了

## 打算

- Memo 会增加功能，但不一定会接入推特啥的，为什么？因为如果服务端渲染会显著增加 build 的时长，如果客户端渲染，可能会被墙。B 站会考虑一下。
- 几年前头铁想搞金色主题，但金色在没有材质时等于屎黄色，效果不如高饱和印象色。算了……就这样吧。
- SSG 的动画有限制，我一直想给顶栏加动画，但 Next.js 之前是不行的，因为完全分割掉了。现在 rr 似乎可以用 Outlet
