import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { Star } from "lucide-react";
import "./styles/RelatedMoviesSection.css";
import { ImageWithFallback } from "./ImageWithFallback";
import { type MovieDetail } from "../../../types/movie";

export default function RelatedMoviesSection({
  relatedIds
}: {
  relatedIds: string[];
}) {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelated() {
      if (!relatedIds || relatedIds.length === 0) {
        setLoading(false);
        return;
      }

      const results: MovieDetail[] = [];

      for (const id of relatedIds) {
        const ref = doc(db, "movies", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          results.push({ id, ...snap.data() } as MovieDetail);
        }
      }

      setMovies(results);
      setLoading(false);
    }

    loadRelated();
  }, [relatedIds]);

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
            <Link key={m.id} to={`/movie/${m.id}`} className="related-card">
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