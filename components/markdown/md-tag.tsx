/**
 * return Tag component with search handler
 */
export function MemoTag(handleClickTag?: (tag: string) => void) {

  function Tag({ text }: { text: string }) {
    // console.debug("[markdown.tsx] detect tag", text)
    return <span className="tag" onClick={() => {
      if (handleClickTag) {
        handleClickTag("#" + text)
      }
    }}>#{text} </span>
  }

  return Tag
}
