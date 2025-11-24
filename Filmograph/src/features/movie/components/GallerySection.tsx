import "./styles/GallerySection.css";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export default function GallerySection({ movie }: { movie: any }) {
  const images = movie?.images ?? {};

  const backdrops = images.backdrops ?? [];
  const posters = images.posters ?? [];

  const hasBackdrops = backdrops.length > 0;
  const hasPosters = posters.length > 0;

  const [preview, setPreview] = useState<string | null>(null);

  /* ================================
     ⭐ 1) 스틸컷 (2줄 기준, 고정 6개 페이징)
     ================================ */
  const backdropPageSize = 6;
  const [pageBackdrop, setPageBackdrop] = useState(0);

  const backdropMaxPage = Math.floor(
    (backdrops.length - 1) / backdropPageSize
  );

  const getBackdropPage = () =>
    backdrops.slice(
      pageBackdrop * backdropPageSize,
      pageBackdrop * backdropPageSize + backdropPageSize
    );

  /* ================================
     ⭐ 2) 포스터 (1줄 자동 꽉 채우기)
     ================================ */
  const posterRowRef = useRef<HTMLDivElement>(null);
  const [posterPerPage, setPosterPerPage] = useState(5);
  const [pagePoster, setPagePoster] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!posterRowRef.current) return;

      const containerWidth = posterRowRef.current.clientWidth;
      const cardWidth = 150; // 최소 카드 너비
      const gap = 16;

      const count = Math.floor(containerWidth / (cardWidth + gap));
      setPosterPerPage(Math.max(count, 1));
    };

    handleResize(); // 최초 계산
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const posterMaxPage = Math.floor(
    (posters.length - 1) / posterPerPage
  );

  const getPosterPage = () =>
    posters.slice(
      pagePoster * posterPerPage,
      pagePoster * posterPerPage + posterPerPage
    );

  /* ================================
     ⭐ 모달 스크롤 제어
     ================================ */
  useEffect(() => {
    document.body.style.overflow = preview ? "hidden" : "";
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

          {/* ================================
             ⭐ 스틸컷
             ================================ */}
          {hasBackdrops && (
            <div className="gallery-block">
              <div className="gallery-subtitle-row">
                <h3 className="gallery-subtitle">스틸컷</h3>

                {backdrops.length > backdropPageSize && (
                  <div className="gallery-pagination">
                    <button
                      disabled={pageBackdrop === 0}
                      onClick={() => setPageBackdrop((p) => p - 1)}
                    >
                      {"<"}
                    </button>
                    <button
                      disabled={pageBackdrop === backdropMaxPage}
                      onClick={() => setPageBackdrop((p) => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div className="gallery-grid">
                {getBackdropPage().map((img, idx) => (
                  <div
                    key={idx}
                    className="gallery-card"
                    onClick={() => setPreview(img)}
                  >
                    <ImageWithFallback src={img} className="gallery-img" />
                    <div className="gallery-hover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================
             ⭐ 포스터 (1줄 꽉 채움)
             ================================ */}
          {hasPosters && (
            <div className="gallery-block">
              <div className="gallery-subtitle-row">
                <h3 className="gallery-subtitle">포스터</h3>

                {posters.length > posterPerPage && (
                  <div className="gallery-pagination">
                    <button
                      disabled={pagePoster === 0}
                      onClick={() => setPagePoster((p) => p - 1)}
                    >
                      {"<"}
                    </button>
                    <button
                      disabled={pagePoster === posterMaxPage}
                      onClick={() => setPagePoster((p) => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div className="gallery-posters" ref={posterRowRef}>
                {getPosterPage().map((img, idx) => (
                  <div
                    key={idx}
                    className="poster-card"
                    onClick={() => setPreview(img)}
                  >
                    <ImageWithFallback src={img} className="poster-img" />
                    <div className="gallery-hover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================
         ⭐ 미리보기 모달
         ================================ */}
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
