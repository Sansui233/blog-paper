import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "../../lib/throttle";

// source data type and element prop type
type Props<T extends { id: string | number }> = React.HTMLProps<HTMLDivElement> & {
  sources: T[]
  setSources: Dispatch<SetStateAction<T[]>>
  fetchFrom?: (i: number, batchsize: number) => Promise<T[] | undefined> // the function that returns new source data
  batchsize: number

  Elem: (props: {
    source: T
    triggerHeightChange: Dispatch<SetStateAction<boolean>>;
  } & React.HTMLProps<HTMLDivElement>) => JSX.Element // the render

  Loading?: () => JSX.Element

  scrollRef?: React.RefObject<HTMLElement> // get the outer scroll DOM, default for window
}

export type VirtualListType = <T extends {
  id: string | number;
}>(props: Props<T>) => JSX.Element


// TODO fix: placeholder and activeIndex should subscribe when sources is changed
// 这边有个问题是 placeholder 的更新到底由谁控制。由外而内的话是订阅 sources 的改变，由内而外的话是自己更新
// 我偏向于纯自己更新。由外而内不是不行，等于于手搓双向绑定，感觉会不太符合 React 单向数据流的整体逻辑。这也是所有具有 数据自动更新的 组件要考虑的问题。
// 所以正常的单个 virtualist 不应该把数据更新的部分传给外部，应该初始化后就定死，不要用外部的 sources 渲染，只由内部渲染。
// 外部的 source 应该只叫 InitSource 这样
// 但问题是有时候，外部也可能要访问更新后的 source 来渲染一些东西，再结合 React 数据是上到下传递，还是只能把数据放外面
// 所以最终还是得考虑好**状态机**，或者权限控制。纯函数式的思路真的不太好设计这类。
// 我并不想把简单的事情搞复杂，Virtualist 真要拆开写能拆出很多可以优化的东西
// 但目前只需要是知道外部不要去 setSources 就行了，如果要 Set，必须重新渲染一个 VirtualList。
// 在 Memo 的 Search 中，source 刷新必须伴随 searchStatus 的改变。
// TODO scroll to anywhere
// TODO modify height while loading
const VirtualList: VirtualListType = ({ sources, setSources, Elem, scrollRef, fetchFrom: fetchFrom, batchsize, Loading, style, ...otherprops }) => {
  const [placeHolder, setplaceHolder] = useState<number[]>(new Array(sources.length).fill(300))
  // 注意保持 activeIndex 和 sources 的状态一致性
  const [activeIndex, setActiveIndex] = useState<number[]>(new Array(sources.length).fill(0).map((_, i) => i))
  const [winBreakPoint, setWinBreakPoint] = useState(sources.length * 3)
  const [isLoading, setIsLoading] = useState(false) // render the loading compoenent or not
  const scrollLock = useRef({ enable: true }) // true means enable scroll

  const minHeight = useMemo(() => placeHolder.reduce((sum, height) => sum += height, 0), [placeHolder])

  const transformOnIndex = useCallback((i: number) => {
    let sum = 0
    for (let j = 0; j < i; j++) {
      sum += placeHolder[j]
    }
    return sum
  }, [placeHolder])

  // scroll monitor. when < 30% or > 30%, 
  // fetch new source and set source
  // concating placeholder with extended data length 
  useEffect(() => {
    const scrollElem = scrollRef?.current
    const handler = () => {
      if (!scrollLock.current.enable) return // false means disable scroll

      const scrollHeight = transformOnIndex(activeIndex[activeIndex.length - 1]) - transformOnIndex(activeIndex[0]) // okay?
      const currScrollTop = (scrollElem ? scrollElem.scrollTop : globalThis.scrollY) - transformOnIndex(activeIndex[0])
      const currScrollBottom = currScrollTop + globalThis.innerHeight - (scrollElem ? (scrollElem.getBoundingClientRect().y > 0 ? scrollElem.getBoundingClientRect().y : 0) : 0)
      // console.debug("scroll", scrollHeight, currScrollTop, currScrollBottom)

      const progress = currScrollTop / scrollHeight
      const progressBottom = currScrollBottom / scrollHeight
      // console.debug("progress", scrollHeight, progress, progressBottom)

      if (isNaN(progress) || !isFinite(progress) || progress > 1.5) return

      scrollLock.current = { enable: false }

      if (fetchFrom && progress < 0.2) {
        const reqStart = activeIndex[0] - batchsize
        if (reqStart < 0) {
          scrollLock.current = { enable: true }
          return
        }

        setIsLoading(true)
        fetchFrom(reqStart, batchsize).then(prevdata => {
          setIsLoading(false)
          if (!prevdata || prevdata.length === 0) { // head
            scrollLock.current = { enable: true }
            return
          }

          let prevActiveIndex = activeIndex.map(aci => aci - activeIndex.length)
          if (prevdata.length > activeIndex.length) {
            const additional = new Array(prevdata.length - activeIndex.length).fill(0).map((_, i) => i - prevdata.length + activeIndex.length + prevActiveIndex[0])
            prevActiveIndex = additional.concat(prevActiveIndex)
          } else if (prevdata.length < activeIndex.length) {
            prevActiveIndex = prevActiveIndex.slice(activeIndex.length - prevdata.length, activeIndex.length)
          }

          const fullIndex = prevActiveIndex.concat(activeIndex)
          const fulldata = prevdata.concat(sources)

          // slide window
          if (fullIndex.length > winBreakPoint) {
            fullIndex.splice(0 - prevActiveIndex.length, prevActiveIndex.length)
            fulldata.splice(0 - prevActiveIndex.length, prevActiveIndex.length)
          }

          setActiveIndex(fullIndex)
          setSources(fulldata)
          scrollLock.current = { enable: true }
        })

      } else if (fetchFrom && progressBottom > 0.8) {
        const reqStart = activeIndex[activeIndex.length - 1] + 1
        setIsLoading(true)
        fetchFrom(reqStart, batchsize).then(nextdata => {
          setIsLoading(false)
          if (!nextdata || nextdata.length === 0) { // tail
            scrollLock.current = { enable: true }
            return
          }

          let nextActiveIndex = activeIndex.map(aci => aci + activeIndex.length)
          if (nextdata.length > activeIndex.length) {
            const additional = new Array(nextdata.length - activeIndex.length).fill(0).map((_, i) => i + nextActiveIndex[nextActiveIndex.length - 1])
            nextActiveIndex = nextActiveIndex.concat(additional)
          } else if (nextdata.length < activeIndex.length) {
            nextActiveIndex = nextActiveIndex.slice(0, nextdata.length)
          }

          if (nextActiveIndex[nextActiveIndex.length - 1] > placeHolder.length - 1) {
            const additional = new Array(nextActiveIndex[nextActiveIndex.length - 1] - placeHolder.length + 1).fill(300)
            setplaceHolder(placeHolder.concat(additional))
          }

          const fullIndex = activeIndex.concat(nextActiveIndex)
          const fulldata = sources.concat(nextdata)

          // slide window
          if (fullIndex.length > winBreakPoint) {
            fullIndex.splice(0, nextdata.length)
            fulldata.splice(0, nextdata.length)
          }

          setActiveIndex(fullIndex)
          setSources(fulldata)
          scrollLock.current = { enable: true }
        })

      } else {
        scrollLock.current = { enable: true }
      }
    }

    const throttled = throttle(handler, 500)

    if (scrollElem) {
      scrollElem.addEventListener("scroll", throttled)
    } else {
      globalThis.addEventListener("scroll", throttled)
    }

    return () => {
      if (scrollElem) {
        scrollElem.addEventListener("scroll", throttled)
      } else {
        globalThis.removeEventListener("scroll", throttled)
      }
    }
  }, [scrollLock, scrollRef, fetchFrom, activeIndex, setSources, placeHolder, transformOnIndex, sources, batchsize, winBreakPoint])

  return (
    <div style={Object.assign({
      position: "relative",
      width: "100%",
      minHeight: `${minHeight}px`
    }, style)}
      className={otherprops.className}
    >
      {sources.map((e, i) => <ListItem key={e.id} index={activeIndex[i]} Elem={Elem} source={e} placeHolder={placeHolder} setplaceHolder={setplaceHolder} />)}
      {Loading && isLoading ? <div style={{
        position: "absolute",
        width: "100%",
        transform: `translateY(${placeHolder.slice(0, placeHolder.length).reduce((sum, height) => sum += height, 0)}px)`
      }}>
        <Loading />
      </div> : null}
    </div>
  )
}


function ListItem<T extends { id: string | number }>({ Elem, index, source, placeHolder, setplaceHolder }: {
  Elem: Props<T>["Elem"],
  source: T;
  index: number
  placeHolder: number[]
  setplaceHolder: Dispatch<SetStateAction<number[]>>
}) {

  const ref = useRef<HTMLDivElement>(null)
  const handler = useCallback(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      setplaceHolder(placeHolder => {
        if (placeHolder[index] === height || height === 0) return placeHolder
        const newplaceHolder = [...placeHolder]
        newplaceHolder[index] = height
        return newplaceHolder
      })
    }
  }, [ref, setplaceHolder, index])

  // on window resize
  useEffect(() => {
    const throttled = throttle(handler, 150)
    globalThis.addEventListener("resize", throttled)
    return () => {
      globalThis.removeEventListener("resize", throttled)
    }
  }, [ref, index, setplaceHolder, handler])

  // 有两个原因会影响高度
  // 一是外部窗口 resize,靠监听执行
  // 二是元素内部主动触发的变化，靠手动点击执行
  // 因此需要一个状态要交给元素内部执行高度变化

  const [isHeightChange, triggerHeightChange] = useState(false)
  useEffect(() => {
    if (isHeightChange) {
      handler()
      triggerHeightChange(false)
    }
  }, [isHeightChange, handler])

  // visible after height is set
  const [isvisible, setIsVisible] = useState(false)
  useEffect(() => {
    handler()
    setIsVisible(true)
  }, [ref, handler])

  // calc translateY
  const translateY = useMemo(() => {
    return placeHolder.slice(0, index).reduce((sum, height) => sum += height, 0)
  }, [index, placeHolder])

  return (
    <div ref={ref} style={{
      position: "absolute",
      width: "100%",
      transform: `translateY(${translateY}px)`,
      visibility: isvisible ? "visible" : "hidden",
    }}>
      {Elem({
        source,
        triggerHeightChange
      })}
    </div>
  )

}

export default VirtualList