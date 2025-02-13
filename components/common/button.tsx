import styled from 'styled-components'

const Button = styled.button`
  margin: 0;
  border: 1px solid transparent;  //自定义边框
  outline: none;    //消除默认点击蓝色边框效果
  border-radius: 1.5em;
  padding: 0.3em 1em;
  font-size: 0.9rem;
  
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.textSecondary};
  transition: background 0.5s ease;
  cursor:pointer;

  &:hover {
    background: ${p => p.theme.colors.accentHover};
  }
`

export default Button