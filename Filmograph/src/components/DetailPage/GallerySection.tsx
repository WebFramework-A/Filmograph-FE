import "./styles/GallerySection.css";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

type ImageItem = string | null;

interface GalleryProps {
  movie: {
    images?: {
      backdrops?: string[];
      posters?: string[];
    };
  };
}

function getStablePage(arr: string[], page: number, size: number): ImageItem[] {
  const slice = arr.slice(page * size, (page + 1) * size);
  const diff = size - slice.length;
  return diff > 0 ? [...slice, ...Array(diff).fill(null)] : slice;
}

export default function GallerySection({ movie }: GalleryProps) {
  const images = movie?.images ?? {};
  const backdrops = images.backdrops ?? [];
  const posters = images.posters ?? [];

  const [preview, setPreview] = useState<string | null>(null);

  // 스틸컷 (2줄 고정)
  const [backdropCols, setBackdropCols] = useState<number>(4);
  const [backdropSize, setBackdropSize] = useState<number>(8);
  const [pageBackdrop, setPageBackdrop] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;

      if (w >= 1200) setBackdropCols(4);
      else if (w >= 900) setBackdropCols(3);
      else setBackdropCols(2);

      setBackdropSize(backdropCols * 2);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [backdropCols]);

  const backdropMaxPage = Math.floor((backdrops.length - 1) / backdropSize);

  // 포스터 (1줄 고정)
  const [posterCols, setPosterCols] = useState<number>(5);
  const [posterSize, setPosterSize] = useState<number>(5);
  const [pagePoster, setPagePoster] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;

      if (w >= 1200) setPosterCols(5);
      else if (w >= 900) setPosterCols(4);
      else setPosterCols(2);

      setPosterSize(posterCols);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [posterCols]);

  const posterMaxPage = Math.floor((posters.length - 1) / posterSize);

  // preview 모달 스크롤 락
  useEffect(() => {
    document.body.style.overflow = preview ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview]);

  if (!backdrops.length && !posters.length) return null;

  return (
    <>
      <section className="gallery-wrapper overflow-hidden">
        <div className="gallery-container">
          <div className="gallery-header">
            <ImageIcon className="gallery-icon" />
            <h2 className="gallery-title">갤러리</h2>
          </div>

          {/* 스틸컷 */}
          {backdrops.length > 0 && (
            <div className="gallery-block">
              <div className="gallery-subtitle-row">
                <h3 className="gallery-subtitle">스틸컷</h3>

                {backdrops.length > backdropSize && (
                  <div className="gallery-pagination">
                    <button
                      disabled={pageBackdrop === 0}
                      onClick={() => setPageBackdrop(p => p - 1)}
                    >
                      {"<"}
                    </button>

                    <button
                      disabled={pageBackdrop === backdropMaxPage}
                      onClick={() => setPageBackdrop(p => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div
                key={pageBackdrop}
                className="gallery-grid"
                style={{
                  gridTemplateColumns: `repeat(${backdropCols}, 1fr)`,
                }}
              >
                {getStablePage(backdrops, pageBackdrop, backdropSize).map(
                  (img: ImageItem, idx: number) =>
                    img ? (
                      <div
                        key={idx}
                        className="gallery-card"
                        onClick={() => setPreview(img)}
                      >
                        <ImageWithFallback src={img} className="gallery-img" />
                      </div>
                    ) : (
                      <div key={idx} className="gallery-empty-slot"></div>
                    )
                )}
              </div>
            </div>
          )}

          {/* 포스터 */}
          {posters.length > 0 && (
            <div className="gallery-block">
              <div className="gallery-subtitle-row">
                <h3 className="gallery-subtitle">포스터</h3>

                {posters.length > posterSize && (
                  <div className="gallery-pagination">
                    <button
                      disabled={pagePoster === 0}
                      onClick={() => setPagePoster(p => p - 1)}
                    >
                      {"<"}
                    </button>

                    <button
                      disabled={pagePoster === posterMaxPage}
                      onClick={() => setPagePoster(p => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div
                key={pagePoster}
                className="gallery-posters"
                style={{
                  gridTemplateColumns: `repeat(${posterCols}, 1fr)`,
                }}
              >
                {getStablePage(posters, pagePoster, posterSize).map(
                  (img: ImageItem, idx: number) =>
                    img ? (
                      <div
                        key={idx}
                        className="poster-card"
                        onClick={() => setPreview(img)}
                      >
                        <ImageWithFallback src={img} className="poster-img" />
                      </div>
                    ) : (
                      <div key={idx} className="poster-empty-slot"></div>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {preview && (
        <div className="preview-modal">
          <div className="preview-content">
            <ImageWithFallback src={preview} className="preview-img" />
            <button className="preview-close" onClick={() => setPreview(null)}>
              <X size={30} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}