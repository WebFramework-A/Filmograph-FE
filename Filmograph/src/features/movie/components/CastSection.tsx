import "./styles/CastSection.css";

export default function CastSection({ movie }: { movie: any }) {
  if (!movie) return null;

  const cast =
    movie.cast?.length > 0
      ? movie.cast
      : movie.actors?.map((name: string) => ({
          name,
          character: null,
        }));

  return (
    <section className="cast-wrapper">
      <div className="cast-container">
        <h2 className="cast-title">출연진</h2>

        <div className="cast-grid">
          {cast.map((actor: any, index: number) => (
            <div key={index} className="cast-card">
              <p className="cast-name">{actor.name}</p>

              <p className="cast-role">
                {actor.character ? actor.character : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}