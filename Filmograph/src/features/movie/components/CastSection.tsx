import "./styles/CastSection.css";
import { useState, useRef, useEffect } from "react";

export default function CastSection({ movie }: { movie: any }) {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  
  const cast =
  movie.cast?.length > 0
  ? movie.cast
  : movie.actors?.map((name: string) => ({
    name,
    character: null,
  })) ?? [];
  
  const maxPage = Math.floor((cast.length - 1) / itemsPerPage);
  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, maxPage));
  
  const visibleCast = cast.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  
  useEffect(() => {
    const calc = () => {
      if (!containerRef.current || !cardRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const cardWidth = cardRef.current.clientWidth;
      const cardStyle = window.getComputedStyle(cardRef.current);
      const gap = parseInt(cardStyle.marginRight || "16");
      
      const columns = Math.floor(containerWidth / (cardWidth + gap));
      
      const autoPageSize = columns * 2;
      
      setItemsPerPage(autoPageSize > 0 ? autoPageSize : 8);
    };
    
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  
  if (!movie) return null;

  return (
    <section className="cast-wrapper overflow-hidden">
      <div className="cast-container">
        
        {/* 제목 + 버튼 */}
        <div className="cast-header-row">
          <h2 className="cast-title">출연진</h2>

          {cast.length > itemsPerPage && (
            <div className="paging-buttons">
              <button onClick={handlePrev} disabled={page === 0}>{"<"}</button>
              <button onClick={handleNext} disabled={page === maxPage}>{">"}</button>
            </div>
          )}
        </div>

        {/* 그리드 */}
        <div className="cast-grid-container" ref={containerRef}>
          <div className="cast-slide no-animation">
            <div className="cast-grid">
              {visibleCast.map((actor: any, index: number) => (
                <div
                  key={index}
                  className="cast-card"
                  ref={index === 0 ? cardRef : null}
                >
                  <p className="cast-name">{actor.name}</p>
                  {actor.character  && (
                    <p className="cast-role">{actor.character}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}