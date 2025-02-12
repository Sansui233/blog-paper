import { Github, Mail, Rss } from 'lucide-react'
import styled from 'styled-components'
import { siteInfo } from '../../site.config'

type Props = React.HTMLProps<HTMLDivElement>

const Footer = (props: Props) => {
  return (
    <Container {...props}>
      <a href={siteInfo.social.github}><Github /></a>
      <a href={`mailto:${siteInfo.social.email}`}><Mail /></a>
      <a href="/rss"><Rss /></a>
      <div>{"Code & Design by Sansui 2025"} <br /> {"All rights reserved"}</div>
    </Container>
  )
}

const Container = styled.footer`
  padding: 24px 0 10px 0;
  text-align: center;
  font-size: 0.625rem;

  div {
    margin: 1.5rem auto;
    letter-spacing: 0.2px;
  }

  a:hover {
    color: ${p => p.theme.colors.accentHover};
  }

  svg {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }
`

export default Footer