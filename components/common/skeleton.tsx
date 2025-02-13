// SkeletonLoader.tsx
import { CircleAlert } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

/**
 * Loading
 */
const loading = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

export const SkeletonLoading = styled.div<{ height?: string, width?: string, borderRadius?: string }>`
  background: linear-gradient(
    45deg,
    #55555525 25%,
    #bbbbbb25 50%,
    #55555525 75%
  );
  background-size: 400% 200%;
  animation: ${loading} 5s infinite linear;
  border-radius: ${({ borderRadius }) => borderRadius || '0.5rem'};
  height: ${({ height }) => height || '100px'};
  width: ${({ width }) => width || '100%'};
`;


/**
 * Error
 */

const ErrorStyle = styled.div<{ height?: string, width?: string, borderRadius?: string }>`
  border-radius: ${({ borderRadius }) => borderRadius || '0.5rem'};
  height: ${({ height }) => height || '100px'};
  width: ${({ width }) => width || '100%'};
  background: #88888825;
  padding: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #88888866;

  svg {
    display: inline-block !important;
    margin: 0 0.5rem 0 0;
  }

  span {
    font-size: 1.25rem;
    font-weight: 600;
  }
`;


export function SkeletonError(props: { height?: string, width?: string, borderRadius?: string, text?: string }) {
  return (
    <ErrorStyle height={props.height} width={props.width} borderRadius={props.borderRadius}>
      <CircleAlert /><span>{props.text || 'Load Failed'}</span>
    </ErrorStyle>
  )
}


