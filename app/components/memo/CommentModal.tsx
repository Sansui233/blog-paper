import { Loader2, X } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { siteInfo } from "site.config";

// Lazy load Waline component
const Waline = lazy(() => import("~/components/common/waline"));

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Click position for animation origin */
  clickPosition?: { x: number; y: number };
}

export function CommentModal({
  isOpen,
  onClose,
  clickPosition,
}: CommentModalProps) {
  const [isBeforeClose, setIsBeforeClose] = useState(false);

  // Calculate animation origin based on click position
  const getTransformOrigin = useCallback(() => {
    if (!clickPosition) return "center center";
    return `${clickPosition.x}px ${clickPosition.y}px`;
  }, [clickPosition]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsBeforeClose(true);
    setTimeout(() => {
      onClose();
      setIsBeforeClose(false);
    }, 300);
  }, [onClose]);

  // Keyboard escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!siteInfo.walineApi || !isOpen) return null;

  return (
    <div
      className={`bg-bg-modal fixed inset-0 z-20 cursor-zoom-out ${
        isBeforeClose ? "animate-focus-out" : "animate-focus-in"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}
    >
      {/* Comment container - fixed size, scale animation from click position */}
      <div
        className={`border-ui-line-gray-2 bg-bg mx-auto h-full w-full max-w-195 cursor-default overflow-y-auto border py-8 shadow-[0_0_24px_0_var(--shadow-bg)] min-[780px]:mt-[2vh] min-[780px]:h-[96vh] min-[780px]:rounded-lg ${
          isBeforeClose ? "animate-scale-out" : "animate-scale-in"
        }`}
        style={{
          transformOrigin: getTransformOrigin(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-[90%]">
          <Suspense fallback={<LoadingSpinner />}>
            <Waline />
          </Suspense>
        </div>
      </div>

      {/* Close bar - top right on desktop, bottom center on mobile */}
      <div className="text-text-gray-3 hover:text-text-primary fixed top-2 right-0 left-0 flex h-10 justify-end px-2 max-[780px]:top-auto max-[780px]:bottom-2 max-[780px]:justify-center">
        <div
          className="border-ui-line-gray-2 flex cursor-pointer items-center rounded-lg border px-2 py-1 shadow-[0_0_12px_0_var(--shadow-bg)] backdrop-blur-md"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          Close <X size="1.25em" className="ml-1" />
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="text-text-gray-3 flex min-h-50 items-center justify-center gap-2">
      <Loader2 size={24} className="animate-spin" />
      <span>Loading comments...</span>
    </div>
  );
}

export default CommentModal;
