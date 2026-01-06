# RR7 中的路由间状态追踪

## 同一个组件内的状态追踪

搜索功能本来是通过组件内判断 URL 和 searchParams   状态的更新来获取变更，现在发现第一次不会显示 search 状态。调试后发现是这种流程。

> 点击span -> setSearchParams -> client Loader 更新数据 -> url 变更（navigator变更） -> 更新组件 -> 更新 searchParams

因此永远不要依靠组件内的 searchParams 追踪用户状态。searchParams 是**在数据更新完成后** 的状态。用户操作状态应该始终在点击时追踪，并在数据更新完成后更新。这种情况无法避免会使用到状态机。

针对单个组件里跨路由的情况，你应该对当前的整个组件页面，建立组件级别的的用户操作 UI 状态。

一个比较理想的模式是 useReducer，但是写起来真的非常麻烦。在简单情况下，useState 是可行的。但你要确保 State 是随着用户点击和 URL 更新的。如果有复杂的状态再考虑 reducer 追踪。Zustand 也是一个不错的方案，但他是全局的，你需要确保他不会被不需要的组件引用。

### navitation.state

在触发 setSearchParams 时，clientLoader 加载前，会对 navigation 状态进行修改，所以也可以据navigation判断：
```
> navagation.state
loading
> navigation.location 
{pathname: '/memos', search: '?tag=react', hash: '', state: null, key: 'phz9t0ns'}
```

### setting search params

文档里写得很清楚了，当 SetSearchParams 时，会 cause navigation。 因此客户端渲染完整的流程是。

> 点击span -> SetSearchParams -> navigation path updated ->  navigation state updated -> client loader work -> update props -> update searchParams

## Link 组件与跨组件状态追踪

点击 Link 组件会由客户端接管导航。Link 是拦截了 history api，此时

> 点击 link -> 上一个组件卸载前 navigation 更新为 loading -> 卸载上一个组件，渲染下一个组件 -> 下一个组件渲染完成 -> 此时获取新组件的 navigation，必然是 idle

也就是你永远无法在下一个组件里面看到进入组件这个动作的 loading 状态。因此跨组件的导航必须有一个外层的包裹的状态，这也是我选择 React Router7 做 SSG 的原因之一，非常方便。

在之前的 Next.js Pages Route 是无法做到这一点的。或者说，手动做可以，但非常不清晰，layout 与组件是完全分开的逻辑。我不认为博客就应该用这种简单但结构固定的模式，博客与其说是内容，对于开发而言还是种学习。你总会想再加点什么东西。

**嵌套路由 Outlet 模式**

Outlet 的子组件通过 Link 切换时，Outlet 是永远不会被卸载的。

因此，你可以给整个 App 上一个 Outlet 假进度条，这样页面切换时，不论做什么都能显示状态。

**子组件控制 Layout**

如果你想点击一下按钮开始下载，在最近的 Outlet 上显示进度怎么办？

和 Next.js 不同，Remix 里不是严格区分 client 和 server Boundary 的 设计（恕我直言，我觉得有点过度设计，正如基于文件系统的路由那样）, 所以 Outlet 是像原生 React 那样具有客户端的能力的，能直接使用 use-context 等 API。

在 Remix 里你可以有两种方法
- 1. 通过子组件 useOutletContext（但在 SSG 时是没用的，只在 Client有用，而且是依赖反转，有可能需要预防 Layout 首屏不一致性的问题）
- 2. 如果是 URL 做状态传递，Outlet 去监听 URL（自顶向下的，没有不一致性问题）

## Link 和 setSearchParams 比较

先给个结论：在同一个路由同一个组件下，使用 `Link` 和使用 `setSearchParams` 本质上没有任何区别。他们都会触发 navigator 的更新和 client-loader 的更新。

> Link一般会回到顶部, setSearchParam 不会。

组件没更新，你为什么会觉得 Link 会回到顶部。

> Link 会重复请求 SSG 数据，setSearchParam 不会

应该说 Link 是一定会重复请求， SearchParam 是可能请求。

如果你的 client loader 有默认返回 SSG 数据，那 setSearchParam 还会根据条件请求 SSG Data。





