import { init } from '@waline/client';
import '@waline/client/style';
import { useEffect } from 'react';
import styled from 'styled-components';
import { siteInfo } from "../../site.config";

const Waline = (props: React.HTMLProps<HTMLDivElement>) => {
  useEffect(() => {
    if (!siteInfo.walineApi) {
      return;
    }
    // 挂载 waline 评论系统
    init({
      el: '#waline',
      serverURL: siteInfo.walineApi ? siteInfo.walineApi : "",
      path: window.location.pathname,
      pageview: true,
      comment: true,
    });

  }, [])

  if (siteInfo.walineApi && siteInfo.walineApi !== "") {
    return (
      <StyledWL id="waline" {...props}>Waline</StyledWL>
    )
  } else {
    console.log("Comment system not loaded")
    return <></>
  }
}

const StyledWL = styled.div`

  margin: 0 auto;

  --waline-theme-color: ${p => p.theme.colors.bgInverse};
  --waline-bg-color: ${p => p.theme.colors.bg};
  --waline-color: ${p => p.theme.colors.textGray};
  --waline-active-color: ${p => p.theme.colors.accent};
  --waline-bg-color-light: #99999915;
  --waline-border: 1px solid #99999966;
  --waline-border-color: #99999966;
  --waline-info-bg-color: #99999915;

  .wl-btn.primary {
    background: ${p => p.theme.colors.bgInverse};
    color:${p => p.theme.colors.bg};
  }
  .wl-gif-popup {
    @media screen and (max-width: 580px) {
      .wl-gallery-column {
        display: grid !important;
        grid-template-columns: 1fr 1fr 1fr;
        max-height: 200px;
      }
    }
    img {
      border-color: ${p => p.theme.colors.bg};
    }
    input {
      background: ${p => p.theme.colors.bg};
      color: ${p => p.theme.colors.textPrimary};
    }
  }


  // @media screen and (max-width:580px) {
  //   .wl-footer {
  //     margin: unset;
  //     padding: 0.5rem 0.75rem;
  //   }
  
  //   .wl-gif-popup {
  //     width: 100%;
  //     left: 0;
  //     padding: 0;
  //   }
  // }

`

export default Waline
