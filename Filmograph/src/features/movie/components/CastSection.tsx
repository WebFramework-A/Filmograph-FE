import "./styles/CastSection.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 8;

export default function CastSection({ movie }: { movie: any }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  
  if (!movie) return null;

  const cast =
    movie.cast?.length > 0
      ? movie.cast
      : movie.actors?.map((name: string) => ({
          name,
          character: null,
        })) ?? [];

  const maxPage = Math.floor((cast.length - 1) / ITEMS_PER_PAGE);

  const handlePrev = () => {
    setDirection(1);
    setPage((p) => Math.max(p - 1, 0));
  };

  const handleNext = () => {
    setDirection(-1);
    setPage((p) => Math.min(p + 1, maxPage));
  };

  const visibleCast = cast.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <section className="cast-wrapper">
      <div className="cast-container">
        <div className="cast-header-row">
          <h2 className="cast-title">출연진</h2>

          {cast.length > ITEMS_PER_PAGE && (
            <div className="paging-buttons">
              <button onClick={handlePrev} disabled={page === 0}>
                {"<"}
              </button>
              <button onClick={handleNext} disabled={page === maxPage}>
                {">"}
              </button>
            </div>
          )}
        </div>

        <div className="cast-grid-container">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              className="cast-slide"
              initial={{ x: 140 * direction, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -140 * direction, opacity: 0 }}
              transition={{
                duration: 0.45,
                ease: "easeInOut",
              }}
            >
              <div className="cast-grid">
                {visibleCast.map((actor: any, index: number) => (
                  <div key={index} className="cast-card">
                    <p className="cast-name">{actor.name}</p>
                    {actor.character && (
                      <p className="cast-role">{actor.character}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}