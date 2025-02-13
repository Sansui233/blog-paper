import Link from 'next/link'
import styled from 'styled-components'
import { hoverRound } from '../../styles/css'

// 从下向上的色块
const LinkWithLine = styled(Link)`
  position: relative;

  &::before {
    ${hoverRound}
    height: 0;
    transition: height .3s ease;
  }
  
  &:hover::before {
    height: 0.4rem;
  }
`

// 横着的线嗖得一下过去
const HoverWithLine = styled.span`
  position: relative;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.accent};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }

  &:hover::before {
    width: 100%;
  }
`

// 从下向上的色块
const HoverWithBoxShadow = styled.span`

  position: relative;
  border-bottom: 1px solid ${props => props.theme.colors.accent};
  cursor: pointer;

  &::before {
    ${hoverRound}
    height: 0;
    transition: height .3s ease;
  }
  
  &:hover::before {
    height: 0.4rem;
  }

`

export { HoverWithBoxShadow, HoverWithLine, LinkWithLine }

