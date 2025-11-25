import "./styles/GallerySection.css";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export default function GallerySection({ movie }: { movie: any }) {
  const images = movie?.images ?? {};
  const backdrops = images.backdrops ?? [];
  const posters = images.posters ?? [];

  const hasBackdrops = backdrops.length > 0;
  const hasPosters = posters.length > 0;

  const [preview, setPreview] = useState<string | null>(null);

  const [backdropPageSize, setBackdropPageSize] = useState(8);
  const [pageBackdrop, setPageBackdrop] = useState(0);

  useEffect(() => {
    const updateBackdropSize = () => {
      const w = window.innerWidth;

      let perRow = 4;
      if (w >= 1200) perRow = 4;
      else if (w >= 900) perRow = 3;
      else perRow = 2;

      setBackdropPageSize(perRow * 2);
    };

    updateBackdropSize();
    window.addEventListener("resize", updateBackdropSize);
    return () => window.removeEventListener("resize", updateBackdropSize);
  }, []);

  const backdropMaxPage =
    Math.floor(backdrops.length / backdropPageSize) - 1;

  const getBackdropPage = () =>
    backdrops.slice(
      pageBackdrop * backdropPageSize,
      pageBackdrop * backdropPageSize + backdropPageSize
    );

  const [posterPerPage, setPosterPerPage] = useState(6);
  const [pagePoster, setPagePoster] = useState(0);

  useEffect(() => {
    const updatePosterSize = () => {
      const w = window.innerWidth;

      if (w >= 1200) setPosterPerPage(6);
      else if (w >= 900) setPosterPerPage(4);
      else setPosterPerPage(2);
    };

    updatePosterSize();
    window.addEventListener("resize", updatePosterSize);
    return () => window.removeEventListener("resize", updatePosterSize);
  }, []);

  const posterMaxPage =
    Math.floor(posters.length / posterPerPage) - 1;

  const getPosterPage = () =>
    posters.slice(
      pagePoster * posterPerPage,
      pagePoster * posterPerPage + posterPerPage
    );
    
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
                      disabled={
                        pageBackdrop === backdropMaxPage ||
                        getBackdropPage().length < backdropPageSize
                      }
                      onClick={() => setPageBackdrop((p) => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div className="gallery-grid">
                {getBackdropPage().map((img: string, idx: number) => (
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
                      disabled={
                        pagePoster === posterMaxPage ||
                        getPosterPage().length < posterPerPage
                      }
                      onClick={() => setPagePoster((p) => p + 1)}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>

              <div className="gallery-posters">
                {getPosterPage().map((img: string, idx: number) => (
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