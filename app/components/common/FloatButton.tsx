import type { LucideIcon } from 'lucide-react';

type FloatButtonProps = {
  Icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function FloatButton({ Icon, onClick, className = '', style }: FloatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-8 right-4 z-10
        h-10 w-10 rounded-[0.625rem] border-0
        text-xl text-text-gray-2
        bg-tag-bg backdrop-blur-sm
        cursor-pointer
        transition-colors
        hover:text-text-primary
        active:bg-accent-hover active:text-text-primary
        ${className}
      `}
      style={style}
    >
      <Icon size="1em" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </button>
  );
}

export default FloatButton;