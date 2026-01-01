import type { LucideIcon } from 'lucide-react';
import { ArrowUpToLine, Menu } from 'lucide-react';

type FloatButtonProps = {
  Icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
};

function FloatButton({ Icon, onClick, className = '', style }: FloatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-8 right-4 z-10
        h-10 w-10 rounded-[0.625rem] border-0
        text-xl text-text-gray
        bg-tag-bg/80 backdrop-blur-sm
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

type Props = {
  isViewing: boolean;
  onTocToggle: () => void;
};

export function FloatButtons({ isViewing, onTocToggle }: Props) {
  const scrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* TOC toggle button - only visible on mobile/tablet */}
      <FloatButton
        Icon={Menu}
        onClick={(e) => {
          e.stopPropagation();
          onTocToggle();
        }}
        className="max-lg:block hidden"
        style={isViewing ? { bottom: '5.25rem' } : undefined}
      />

      {/* Scroll to top button */}
      {isViewing && (
        <FloatButton
          Icon={ArrowUpToLine}
          onClick={scrollToTop}
        />
      )}
    </>
  );
}
