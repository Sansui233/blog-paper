import styled, { css } from 'styled-components';

type Props = {
  width?: string;
  height?: string;
  isClose: boolean;
  isCloseToggler?: () => void
}

const MenuIcon = ({ width = "1em", height = "1em", isClose: isClose, isCloseToggler: iscloseToggler }: Props) => {
  return (
    <Container width={width} height={height} onClick={iscloseToggler}>
      <Line className={isClose ? 'is-close' : ''} />
      <Middle $isClose={isClose} />
      <Line className={isClose ? 'is-close' : ''} />
    </Container>
  )
}

const Container = styled.div<{
  width: string,
  height: string,
}>`
  width: ${p => p.width};
  height: ${p => p.height ? p.height : "100%"};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;

`

const Line = styled.div`
  background: ${p => p.theme.colors.textPrimary};
  height: 2px;
  transition: all .3s;
  border-radius: 2px;

  &.is-close {
    opacity: 0;
  }
`

const Middle = styled.div<{ $isClose: boolean }>`
  height: 2px;
  position: relative;
  border-radius: 2px;


  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 2px;
    top:0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${p => p.theme.colors.textPrimary};
    transition: all .3s;
  }

  &::before {
    ${p => p.$isClose ? css`transform: rotate(45deg);` : ''}
  }
  &::after {
    ${p => p.$isClose ? css`transform: rotate(-45deg);` : ''}
  }
`

export default MenuIcon