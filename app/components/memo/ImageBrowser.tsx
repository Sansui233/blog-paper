import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Image data type
export type TImage = {
  ok: "loading" | "loaded" | "failed";
  index: number;
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Zustand store for image browser state
interface ImageBrowserState {
  isModal: boolean;
  currentIndex: number;
  imagesData: TImage[];
  setIsModal: (isModal: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setImagesData: (data: TImage[]) => void;
}

export const useImageBrowserStore = create<ImageBrowserState>((set) => ({
  isModal: false,
  currentIndex: 0,
  imagesData: [],
  setIsModal: (isModal) => set({ isModal }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setImagesData: (imagesData) => set({ imagesData }),
}));

/**
 * Full-screen image browser modal
 */
export default function ImageBrowser() {
  const { isModal, currentIndex, imagesData, setIsModal, setCurrentIndex } =
    useImageBrowserStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentImage = imagesData[currentIndex];
  const hasNext = currentIndex < imagesData.length - 1;
  const hasPrev = currentIndex > 0;

  // Navigate to previous image
  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, setCurrentIndex]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [hasNext, currentIndex, setCurrentIndex]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModal(false);
  }, [setIsModal]);

  // Keyboard navigation
  useEffect(() => {
    if (!isModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModal, closeModal, goToPrev, goToNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModal]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    setTouchStart(null);
  };

  if (!isModal || !currentImage) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={closeModal}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
        onClick={closeModal}
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/80 text-sm">
        {currentIndex + 1} / {imagesData.length}
      </div>

      {/* Previous button */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={40} />
        </button>
      )}

      {/* Main image */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage.ok === "loaded" ? (
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-[90vh] object-contain select-none"
            draggable={false}
          />
        ) : currentImage.ok === "loading" ? (
          <div className="text-white/60 text-lg">Loading...</div>
        ) : (
          <div className="text-white/60 text-lg">Failed to load image</div>
        )}
      </div>

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight size={40} />
        </button>
      )}

      {/* Thumbnail strip */}
      {imagesData.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg">
          {imagesData.map((img, i) => (
            <button
              key={i}
              className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                i === currentIndex
                  ? "border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
            >
              {img.ok === "loaded" ? (
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}