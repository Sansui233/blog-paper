import { styled } from "styled-components";
import { dropShadowSoft } from "../../styles/css";

const PopOver = styled.div`
  min-width: 60px;
  min-height: 60px;
  z-index: 20;
  background: ${p => p.theme.colors.bg};
  border-radius: 0.75rem;
  transform: scale3d(1, 1, 1); /* New layer*/
  ${() => dropShadowSoft}
`

export default PopOver;