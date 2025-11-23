import "./styles/GallerySection.css";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export default function GallerySection({ movie }: { movie: any }) {
  const images = movie?.images;
  const [preview, setPreview] = useState<string | null>(null);

  const hasBackdrops = images?.backdrops?.length > 0;
  const hasPosters = images?.posters?.length > 0;

  useEffect(() => {
    if (preview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview]);

  if (!hasBackdrops && !hasPosters) return null;

  return (
    <>
      <section className="gallery-wrapper">
        <div className="gallery-container">
          <div className="gallery-header">
            <ImageIcon className="gallery-icon" />
            <h2 className="gallery-title">갤러리</h2>
          </div>

          {hasBackdrops && (
            <div className="gallery-block">
              <h3 className="gallery-subtitle">스틸컷</h3>
              <div className="gallery-grid">
                {images.backdrops.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="gallery-card"
                    onClick={() => setPreview(img)}
                  >
                    <ImageWithFallback className="gallery-img" src={img} />
                    <div className="gallery-hover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasPosters && (
            <div className="gallery-block">
              <h3 className="gallery-subtitle">포스터</h3>
              <div className="gallery-posters">
                {images.posters.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="poster-card"
                    onClick={() => setPreview(img)}
                  >
                    <ImageWithFallback className="poster-img" src={img} />
                    <div className="gallery-hover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {preview && (
        <div className="preview-modal">
          <div className="preview-content">
            <ImageWithFallback src={preview} className="preview-img" />

            <button
              className="preview-close"
              onClick={() => setPreview(null)}
            >
              <X size={30} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}