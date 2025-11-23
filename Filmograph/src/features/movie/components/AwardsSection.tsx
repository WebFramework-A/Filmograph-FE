import "./styles/AwardsSection.css";
import { Trophy } from "lucide-react";

export default function AwardsSection({ movie }: { movie: any }) {
  const awards = movie?.awards;

  if (!awards || awards.length === 0) return null;

  return (
    <section className="awards-wrapper">
      <div className="awards-container">
        <h2 className="awards-title">수상 내역</h2>

        <div className="awards-list">
          {awards.map((award: any, idx: number) => {
            const isDetail = typeof award === "object";

            const text = isDetail
              ? `${award.name} - ${award.category} (${award.result}${
                  award.year ? `, ${award.year}` : ""
                })`
              : award;

            return (
              <div key={idx} className="award-item">
                <Trophy className="award-icon" />
                <p className="award-text">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}