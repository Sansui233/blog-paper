import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";

// Image ratio types for different display strategies
enum ImgRatioType {
  Normal = "normal", // 正常图: ratio > 0.6 or height < viewport
  Wide = "wide", // 宽图: ratio >= 2
  VeryTall = "veryTall", // 超长图: ratio <= 0.6 and height >= viewport
}

// Zoom levels: 100% -> 150% -> 200% -> back to 100%
const ZOOM_LEVELS = [1, 1.5, 2] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number];

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

/** 目前已经有点复杂了，考虑拆分 feature
 * - ratioType and display strategy
 * - zoom and panning state: style: mouse and touch support
 * - normal state: touch support
 * - thumbnail strip
 * */

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

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const isZoomed = zoomLevel > 1;

  const currentImage = imagesData[currentIndex];
  const hasNext = currentIndex < imagesData.length - 1;
  const hasPrev = currentIndex > 0;

  // Calculate image ratio type for display strategy
  const imgRatioType = useMemo((): ImgRatioType => {
    if (!currentImage || currentImage.ok !== "loaded")
      return ImgRatioType.Normal;

    const { width, height } = currentImage;
    const ratio = width === 0 || height === 0 ? 1 : width / height;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

    if (ratio >= 2) {
      return ImgRatioType.Wide; // 宽图
    } else if (ratio <= 0.6 && height >= viewportHeight) {
      return ImgRatioType.VeryTall; // 超长图
    }
    return ImgRatioType.Normal; // 正常图
  }, [currentImage]);

  // Style configurations based on ratio type
  const containerStyle = useMemo(() => {
    switch (imgRatioType) {
      case ImgRatioType.VeryTall:
        return "max-w-[95vw] max-h-full overflow-y-auto";
      case ImgRatioType.Wide:
      case ImgRatioType.Normal:
      default:
        return "max-w-[100vw] max-h-[90vh] flex items-center justify-center";
    }
  }, [imgRatioType]);

  const imgStyle = useMemo(() => {
    switch (imgRatioType) {
      case ImgRatioType.VeryTall:
        return "max-w-[95vw] select-none"; // No height limit, enable scroll
      case ImgRatioType.Wide:
        return "max-w-[100vw] max-h-[90vh] object-contain select-none";
      case ImgRatioType.Normal:
      default:
        return "max-w-[100vw] max-h-[100vh] object-contain select-none";
    }
  }, [imgRatioType]);

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

  // Reset zoom state
  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  // Toggle zoom level: 100% -> 150% -> 200% -> 100%
  const toggleZoom = useCallback(() => {
    const currentIdx = ZOOM_LEVELS.indexOf(zoomLevel);
    const nextIdx = (currentIdx + 1) % ZOOM_LEVELS.length;
    const nextLevel = ZOOM_LEVELS[nextIdx];
    setZoomLevel(nextLevel);
    if (nextLevel === 1) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Reset zoom when image changes or modal closes
  useEffect(() => {
    resetZoom();
  }, [currentIndex, isModal, resetZoom]);

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

  // Touch handlers for swipe navigation (only when not zoomed)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed) return;
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

  // Drag handlers for zoomed image (mouse)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isZoomed) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: dragOffset.x,
        offsetY: dragOffset.y,
      };
    },
    [isZoomed, dragOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !isZoomed) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setDragOffset({
        x: dragStartRef.current.offsetX + dx,
        y: dragStartRef.current.offsetY + dy,
      });
    },
    [isDragging, isZoomed],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Drag handlers for zoomed image (touch)
  const handleImageTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isZoomed) return;
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetX: dragOffset.x,
        offsetY: dragOffset.y,
      };
    },
    [isZoomed, dragOffset],
  );

  const handleImageTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !isZoomed) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setDragOffset({
        x: dragStartRef.current.offsetX + dx,
        y: dragStartRef.current.offsetY + dy,
      });
    },
    [isDragging, isZoomed],
  );

  const handleImageTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isModal || !currentImage) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={closeModal}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top gradient overlay for button visibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/60 to-transparent" />

      {/* Zoom button */}
      <button
        className="absolute top-4 right-14 z-10 p-2 text-white/80 transition-colors hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          toggleZoom();
        }}
        aria-label={`Zoom ${zoomLevel === 1 ? "in" : zoomLevel === 1.5 ? "more" : "out"}`}
      >
        <ZoomIn size={28} />
        {isZoomed && (
          <span className="absolute -right-1 -bottom-1 rounded bg-white/20 px-1 text-xs">
            {zoomLevel * 100}%
          </span>
        )}
      </button>

      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 p-2 text-white/80 transition-colors hover:text-white"
        onClick={closeModal}
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-sm text-white/80">
        {currentIndex + 1} / {imagesData.length}
      </div>

      {/* Previous button */}
      {hasPrev && (
        <button
          className="absolute top-1/2 left-4 -translate-y-1/2 p-2 text-white/60 transition-colors hover:text-white"
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
        className={`${containerStyle} ${isZoomed ? "overflow-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentImage.ok === "loaded" ? (
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className={`${imgStyle} ${isZoomed ? "cursor-grab" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
            style={{
              transform: `scale(${zoomLevel}) translate(${dragOffset.x / zoomLevel}px, ${dragOffset.y / zoomLevel}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
            draggable={false}
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
          />
        ) : currentImage.ok === "loading" ? (
          <div className="text-lg text-white/60">Loading...</div>
        ) : (
          <div className="text-lg text-white/60">Failed to load image</div>
        )}
      </div>

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-white/60 transition-colors hover:text-white"
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
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg bg-black/50 p-2">
          {imagesData.map((img, i) => (
            <button
              key={i}
              className={`h-12 w-12 overflow-hidden rounded border-2 transition-all ${
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
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
