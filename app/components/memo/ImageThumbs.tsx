import { useEffect, useState } from "react";
import { useImageBrowserStore, type TImage } from "./ImageBrowser";

// Parse img markdown. e.g. ![alt](url)
function parseMarkdownImage(markdownText: string) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/;
  const match = imageRegex.exec(markdownText);

  if (match) {
    const altText = match[1];
    const imageUrl = match[2];
    return { alt: altText, url: imageUrl };
  } else {
    return null;
  }
}

interface ImageThumbsProps {
  imgs_md: string[];
}

export function ImageThumbs({ imgs_md }: ImageThumbsProps) {
  const { setIsModal, setCurrentIndex, setImagesData } = useImageBrowserStore();
  const [thumbData, setThumbData] = useState<TImage[]>(
    new Array(imgs_md.length).fill(1).map((_, index) => ({
      ok: "loading",
      index,
      src: "",
      width: 1,
      height: 1,
      alt: "",
    })),
  );

  // Fetch and load images
  useEffect(() => {
    async function loadImages() {
      const promises: Promise<TImage>[] = imgs_md.map(async (md, index) => {
        const parsed = parseMarkdownImage(md);
        if (!parsed) {
          return {
            ok: "failed",
            index,
            src: "",
            width: 0,
            height: 0,
            alt: "",
          } as TImage;
        }

        const { url, alt } = parsed;

        const image = new Image();
        const loadImage = new Promise((resolve, reject) => {
          image.onload = () => resolve(image);
          image.onerror = () =>
            reject({ ok: "failed", index, src: "", width: 0, height: 0, alt });
          image.src = url;
        });

        let rejectObj;

        await loadImage.catch((reason) => {
          rejectObj = reason;
        });
        if (rejectObj) {
          return rejectObj;
        } else {
          return {
            ok: "loaded",
            index,
            src: url,
            width: image.width,
            height: image.height,
            alt,
          } as TImage;
        }
      });

      try {
        const fetchData: TImage[] = await Promise.all(promises);
        setThumbData(fetchData);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    }

    loadImages();
  }, [imgs_md]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setImagesData(thumbData);
    setIsModal(true);
  };

  if (imgs_md.length === 0) return null;

  // Single image layout
  if (imgs_md.length === 1) {
    const img = thumbData[0];
    // Calculate aspect ratio with limits
    let aspectRatio = 2;
    if (img && img.ok === "loaded") {
      const ratio = img.width / img.height;
      if (ratio > 2.5) {
        aspectRatio = 2.5; // Wide image limit
      } else if (ratio < 0.75) {
        aspectRatio = 0.75; // Tall image limit
      } else {
        aspectRatio = ratio;
      }
    }

    return (
      <div className="h-62.5 pl-12">
        <div
          className="bg-bg-2 relative h-full max-w-full cursor-zoom-in overflow-hidden rounded-lg select-none"
          style={{ aspectRatio }}
          onClick={() => handleImageClick(0)}
        >
          {img?.ok === "loaded" && (
            <img
              loading="lazy"
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    );
  }

  // Multiple images grid layout
  return (
    <div className="mt-2 grid grid-cols-4 gap-1.25 pl-1 max-[580px]:grid-cols-3 min-[580px]:pl-12">
      {thumbData.map((img, i) => (
        <div
          key={i}
          className="bg-bg-2 relative aspect-square cursor-zoom-in overflow-hidden rounded-lg select-none"
          onClick={() => handleImageClick(i)}
        >
          {img.ok === "loaded" && (
            <img
              loading="lazy"
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default ImageThumbs;
