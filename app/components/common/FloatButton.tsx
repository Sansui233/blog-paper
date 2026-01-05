import type { LucideIcon } from "lucide-react";

type FloatButtonProps = {
  Icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function FloatButton({
  Icon,
  onClick,
  className = "",
  style,
}: FloatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-text-gray-2 bg-tag-bg hover:text-text-primary active:bg-accent-hover active:text-text-primary fixed right-4 bottom-8 z-5 h-10 w-10 cursor-pointer rounded-[0.625rem] border-0 text-xl backdrop-blur-sm transition-colors ${className} `}
      style={style}
    >
      <Icon
        size="1em"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </button>
  );
}

export default FloatButton;
