import { ArrowUpToLine, Menu } from 'lucide-react';
import { FloatButton } from '~/components/common/FloatButton';

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