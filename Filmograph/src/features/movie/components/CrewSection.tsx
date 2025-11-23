import "./styles/CrewSection.css";
import { Users } from "lucide-react";

export default function CrewSection({ movie }: { movie: any }) {
  if (!movie) return null;

  const directorName = movie.directors?.[0]?.name ?? movie.director;

  const writers = movie.writers ?? [];
  const producers = movie.producers ?? [];

  return (
    <section className="crew-wrapper">
      <div className="crew-container">
        <h2 className="crew-title">제작진</h2>

        <div className="crew-columns">
          <div className="crew-block">
            <h3 className="crew-header">
              <Users className="crew-header-icon" />
              감독
            </h3>

            <div className="crew-card">
              <p className="crew-name">
                {directorName || "감독 정보 없음"}
              </p>
            </div>
          </div>

          <div className="crew-block">
            <h3 className="crew-header">
              <Users className="crew-header-icon" />
              각본 / 스토리
            </h3>

            <div className="crew-list">
              {writers.length > 0 ? (
                writers.map((writer: any, idx: number) => (
                  <div className="crew-card" key={idx}>
                    <p className="crew-name">{writer.name}</p>
                    {writer.role && (
                      <p className="crew-role">{writer.role}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="crew-empty">등록된 각본 정보 없음</p>
              )}
            </div>
          </div>

          <div className="crew-block">
            <h3 className="crew-header">
              <Users className="crew-header-icon" />
              제작
            </h3>

            <div className="crew-list">
              {producers.length > 0 ? (
                producers.map((p: any, idx: number) => (
                  <div className="crew-card" key={idx}>
                    <p className="crew-name">{p.name}</p>
                    {p.role && (
                      <p className="crew-role">{p.role}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="crew-empty">등록된 제작 정보 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
