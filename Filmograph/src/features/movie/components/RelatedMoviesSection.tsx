import "./styles/RelatedMoviesSection.css";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import type { MovieDetail } from "../../../types/movie";

export default function RelatedMoviesSection({
  movies,
  loading,
}: {
  movies: MovieDetail[];
  loading: boolean;
}) {

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

  return (
    <section className="related-wrapper">
      <div className="related-container">
        <h2 className="related-title">관련 영화</h2>

        <div className="related-grid">
          {movies.map((m) => (
            <Link key={m.id} to={`/detail/${m.id}`} className="related-card">
              <div className="related-poster">
                <ImageWithFallback
                  src={m.posterUrl}
                  alt={m.title}
                  className="related-img"
                />
                <div className="related-hover" />
              </div>

              <h3 className="related-name">{m.title}</h3>

              <div className="related-info">
                <div className="related-rating">
                  <Star className="star-icon" />
                  <span>{m.rating ?? "N/A"}</span>
                </div>
                <span className="related-separator">·</span>
                <span className="related-year">
                  {m.releaseDate?.slice(0, 4) ?? "?"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
