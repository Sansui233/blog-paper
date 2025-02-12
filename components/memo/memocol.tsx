import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import styled from 'styled-components';
import { clientList, createClient } from "../../lib/data/client";
import { compileMdxMemo } from "../../lib/markdown/mdx";
import { SearchStatus } from '../../lib/use-search';
import { TMemo } from '../../pages/memos';
import Footer from "../common/footer";
import { PageDescription } from '../common/page-description';
import { MemoCard, MemoLoading } from "./memocard";
import VirtualList from "./virtuallist";

export default function MemoCol({ postsData, postsDataBackup, setpostsData, setpostsDataBackup, client, searchStatus, resetSearchStatus, setTextAndSearch: setSearchText }: {
  postsData: TMemo[]
  postsDataBackup: TMemo[]
  setpostsData: Dispatch<SetStateAction<TMemo[]>>
  setpostsDataBackup: Dispatch<SetStateAction<TMemo[]>>
  client: keyof typeof clientList,
  searchStatus: SearchStatus,
  resetSearchStatus: () => void
  setTextAndSearch: (text: string, immediateSearch?: boolean) => void
}) {


  // virtual list
  const [cli, setCli] = useState(createClient(client))
  const fetchFrom = useCallback(async (start: number, batchsize: number) => {
    return cli.queryMemoByCount(start, batchsize).then(data => {
      if (data.length > 0) {
        return Promise.all(data.map(async d => {
          return {
            ...d,
            length: d.content.length,
            code: (await compileMdxMemo(d.content)).code
          }
        }))
      } else {
        return undefined
      }
    })
  }, [cli])

  //search status
  function statusRender() {
    switch (searchStatus.isSearch) {
      case "ready":
        return ""
      case "searching":
        return "Searching..."
      case "done":
        return <>
          Results: {postsData.length} memos
          <span
            style={{
              fontStyle: "normal",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "0.875em"
            }}
            onClick={() => {
              resetSearchStatus()
              setpostsData(postsDataBackup)
            }}
          >X</span>
        </>
    }
  }



  return (
    <>
      <PageDescription style={{ marginRight: "1rem" }}>
        {statusRender()}
      </PageDescription>
      <MemoColContainer style={{ minHeight: "80vh", marginTop: "0.625rem" }}>
        {searchStatus.isSearch === "ready" // 首屏的问题……
          ? <VirtualList<TMemo>
            key={"vl1"}
            className='virtualist'
            sources={postsData}
            setSources={setpostsData}
            Elem={(props) => {
              return <MemoCard source={props.source} setSearchText={setSearchText} triggerHeightChange={props.triggerHeightChange} style={props.style} />
            }}
            fetchFrom={fetchFrom}
            batchsize={10}
            Loading={MemoLoading}
          /> : searchStatus.isSearch === "done"
            ? <VirtualList<TMemo>
              key={searchStatus.searchText}
              className='virtualist'
              sources={postsData}
              setSources={setpostsData}
              Elem={(props) => {
                return <MemoCard source={props.source} setSearchText={setSearchText} triggerHeightChange={props.triggerHeightChange} />
              }}
              batchsize={10}
            /> : null}
      </MemoColContainer>
      <Footer style={{ marginTop: "5rem" }} />
    </>
  )
}

const MemoColContainer = styled.div`
min-height: 80vh;
margin: 0.625rem 0;
border-radius: 0.5rem;
border: 1px solid ${props => props.theme.colors.uiLineGray2};
background-color: ${props => props.theme.colors.bg};

box-shadow: 0 0 12px 0 ${props => props.theme.colors.shadowBg};

// MemoCardStyle
.virtualist > div:first-child > section {
  border-radius: 0.5rem 0.5rem 0 0;
}
.virtualist > div:last-child > section {
  border-radius: 0 0 0.5rem 0.5rem;
}

.virtualist > div:not(:last-child) > section {
  border-bottom: solid 1px ${props => props.theme.colors.uiLineGray2};
}

`