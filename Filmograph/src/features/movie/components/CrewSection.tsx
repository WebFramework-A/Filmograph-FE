import "./styles/CrewSection.css";
import { Users } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 3;

export default function CrewSection({ movie }: { movie: any }) {
  const [pageDirector, setPageDirector] = useState(0);
  const [directionDirector, setDirectionDirector] = useState(0);
  
  const [pageWriter, setPageWriter] = useState(0);
  const [directionWriter, setDirectionWriter] = useState(0);
  
  const [pageProducer, setPageProducer] = useState(0);
  const [directionProducer, setDirectionProducer] = useState(0);

  if (!movie) return null;

  const directorList =
    movie.directors?.length > 0
      ? movie.directors.map((d: any) => ({
          name: d.name,
          role: "감독",
        }))
      : movie.director
      ? [{ name: movie.director, role: "감독" }]
      : [];

  const writers = movie.writers ?? [];
  const producers = movie.producers ?? [];

  return (
    <section className="crew-wrapper">
      <div className="crew-container">
        <div className="crew-header-row">
          <h2 className="crew-title">제작진</h2>
        </div>

        <div className="crew-columns">
          <CrewBlock
            title="감독"
            icon={<Users className="crew-header-icon" />}
            list={directorList}
            page={pageDirector}
            setPage={setPageDirector}
            direction={directionDirector}
            setDirection={setDirectionDirector}
          />

          <CrewBlock
            title="각본 / 스토리"
            icon={<Users className="crew-header-icon" />}
            list={writers}
            page={pageWriter}
            setPage={setPageWriter}
            direction={directionWriter}
            setDirection={setDirectionWriter}
          />

          <CrewBlock
            title="제작"
            icon={<Users className="crew-header-icon" />}
            list={producers}
            page={pageProducer}
            setPage={setPageProducer}
            direction={directionProducer}
            setDirection={setDirectionProducer}
          />
        </div>
      </div>
    </section>
  );
}

function CrewBlock({
  title,
  icon,
  list,
  page,
  setPage,
  direction,
  setDirection,
}: any) {
  const maxPage = Math.floor((list.length - 1) / ITEMS_PER_PAGE);

  const visible = list.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    setDirection(1);
    setPage((p: number) => Math.max(p - 1, 0));
  };

  const handleNext = () => {
    setDirection(-1);
    setPage((p: number) => Math.min(p + 1, maxPage));
  };

  return (
    <div className="crew-block">
      <h3 className="crew-header">
        {icon}
        {title}
      </h3>

      {list.length > ITEMS_PER_PAGE && (
        <div className="paging-buttons">
          <button onClick={handlePrev} disabled={page === 0}>
            {"<"}
          </button>
          <button onClick={handleNext} disabled={page === maxPage}>
            {">"}
          </button>
        </div>
      )}

      <div className="crew-list-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            className="crew-slide"
            initial={{ x: 140 * direction, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -140 * direction, opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
          >
            <div className="crew-list">
              {visible.map((p: any, idx: number) => (
                <div className="crew-card" key={idx}>
                  <p className="crew-name">{p.name}</p>
                  {p.role && <p className="crew-role">{p.role}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}