import "./styles/RelatedMoviesSection.css";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState, useEffect } from "react";
import type { MovieDetail } from "../../types/movie";

const round1 = (v?: number | null) =>
  typeof v === "number" ? Math.round(v * 10) / 10 : undefined;

function getStablePage<T>(arr: T[], page: number, size: number): (T | null)[] {
  const slice = arr.slice(page * size, (page + 1) * size);
  const diff = size - slice.length;
  return diff > 0 ? [...slice, ...Array(diff).fill(null)] : slice;
}

export default function RelatedMoviesSection({
  movies,
  loading,
}: {
  movies: MovieDetail[];
  loading: boolean;
}) {
  const [cols, setCols] = useState<number>(5);
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      let newCols = 5;

      if (w >= 1200) newCols = 5;
      else if (w >= 900) newCols = 4;
      else if (w >= 600) newCols = 3;
      else newCols = 2;

      setCols(newCols);
      setPageSize(newCols);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  if (loading) return null;

  if (!movies || movies.length === 0) {
    return (
      <section className="related-wrapper">
        <div className="related-container">
          <h2 className="related-title">관련 영화</h2>
          <p className="related-empty">관련 영화 정보가 없습니다.</p>
        </div>
      </section>
    );
  }

  const maxPage = Math.floor((movies.length - 1) / pageSize);

  return (
    <section className="related-wrapper overflow-hidden">
      <div className="related-container">
        <div className="related-header">
          <h2 className="related-title">관련 영화</h2>

          {movies.length > pageSize && (
            <div className="related-pagination">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                {"<"}
              </button>
              <button
                disabled={page === maxPage}
                onClick={() => setPage((p) => p + 1)}
              >
                {">"}
              </button>
            </div>
          )}
        </div>

        <div
          key={page}
          className="related-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {getStablePage(movies, page, pageSize).map((m, idx) =>
            m ? (
              <Link key={idx} to={`/detail/${m.id}`} className="related-card">
                <div className="related-poster">
                  <ImageWithFallback
                    src={m.posterUrl}
                    alt={m.title}
                    className="related-img"
                  />

                  <div className="related-hover" />
                  <div className="related-go">상세페이지 →</div>
                </div>

                <h3 className="related-name">{m.title}</h3>

                <div className="related-info">
                  <div className="related-rating">
                    <Star className="star-icon" />
                    <span>{round1(m.rating) ?? "N/A"}</span>
                  </div>
                  <span className="related-separator">·</span>
                  <span className="related-year">
                    {m.releaseDate?.slice(0, 4) ?? "?"}
                  </span>
                </div>
              </Link>
            ) : (
              <div key={idx} className="related-card" style={{ opacity: 0 }} />
            )
          )}
        </div>
      </div>
    </section>
  );
}