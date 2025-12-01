import { motion } from "framer-motion";
import { Star, Calendar, Clock, Film } from "lucide-react";
import { type MovieDetail } from "../../types/movie";
import { FavoriteButton } from "./FavoriteButton";
import "./styles/MovieHeader.css";

export default function MovieHeader({ movie }: { movie: MovieDetail }) {
  const formatDate = (d?: string) => {
    if (!d || d.length !== 8) return "-";
    return `${d.slice(0, 4)}. ${d.slice(4, 6)}. ${d.slice(6, 8)}`;
  };

  return (
    <section className="movieHeroSection overflow-hidden">
      <div className="scaleWrapper">
        <div
          className="heroBackground"
          style={{ backgroundImage: `url(${movie.backdropUrl})` }}
        />
        <div className="heroOverlay" />

        <div className="heroContainer">
          <motion.div
            className="posterWrapper"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="posterGlow"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.45 }}
              transition={{ duration: 0.25 }}
            />
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              src={movie.posterUrl}
              alt={movie.title}
              className="heroPoster"
            />
          </motion.div>

          <motion.div
            className="heroInfo"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="topGenreRow">
              <div className="genreTagBox">
                {movie.genre?.map((g) => (
                  <span key={g} className="genrePill">
                    <Film className="genreFilmIconInside" />
                    {g}
                  </span>
                ))}
                {movie.nation && (
                  <span className="nationPill">
                    🌍 {movie.nation}
                  </span>
                )}
              </div>
              <FavoriteButton movieId={movie.id} size="lg" />
            </div>

            <h1 className="heroTitle">{movie.title}</h1>
            {movie.titleEn && <p className="heroSubtitle">{movie.titleEn}</p>}

            <div className="statsRow">
              <div className="statItem">
                <Star className="statIconYellow" />
                <div>
                  <span>평점</span>
                  <strong>{movie.rating?.toFixed(1) ?? "-"}</strong>
                </div>
              </div>

              <div className="statItem">
                <Calendar className="statIconBlue" />
                <div>
                  <span>개봉</span>
                  <strong>{formatDate(movie.releaseDate)}</strong>
                </div>
              </div>

              <div className="statItem">
                <Clock className="statIconGreen" />
                <div>
                  <span>상영시간</span>
                  <strong>{movie.runtime ? `${movie.runtime}분` : "-"}</strong>
                </div>
              </div>
            </div>

            {movie.directors && movie.directors.length > 0 && (
              <div>
                <p className="sectionLabel">주요 감독</p>
                <div className="peopleRow">
                  {movie.directors.map((d) => (
                    <span key={d.name} className="peopleCard">
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <p className="sectionLabel">주요 출연</p>
                <div className="peopleRow">
                  {movie.cast.slice(0, 6).map((c) => (
                    <span key={c.name} className="peopleCard">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}