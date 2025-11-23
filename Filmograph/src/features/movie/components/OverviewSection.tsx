import "./styles/OverviewSection.css";
import { TrendingUp, Star, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function OverviewSection({ movie }: { movie: any }) {
  if (!movie) return null;

  const hasOverview = !!(movie.overview || movie.synopsis);
  const hasAchievements = !!movie.achievements;

  const hasStats =
    typeof movie.voteCount === "number" ||
    typeof movie.popularity === "number" ||
    typeof movie.revenue === "number";

  const shouldRender = hasOverview || hasAchievements || hasStats;

  if (!shouldRender) return null;

  return (
    <section className="overview-wrapper">
      <motion.div
        className="overview-container"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {hasOverview && (
          <>
            <h2 className="overview-title">줄거리</h2>
            <p className="overview-text">
              {movie.overview || movie.synopsis || "줄거리 정보가 없습니다."}
            </p>
          </>
        )}

        {hasAchievements && (
          <div className="overview-achievements">
            <TrendingUp className="achievements-icon" />
            <div>
              <h3 className="achievements-label">주요 성과</h3>
              <p className="achievements-text">{movie.achievements}</p>
            </div>
          </div>
        )}

        {hasStats && (
          <div className="overview-stats">
            {typeof movie.voteCount === "number" && (
              <div className="stat-card">
                <div className="stat-header">
                  <Star className="stat-icon yellow" />
                  <span className="stat-label">투표 수</span>
                </div>
                <p className="stat-value">
                  {movie.voteCount.toLocaleString()}
                </p>
              </div>
            )}

            {typeof movie.popularity === "number" && (
              <div className="stat-card">
                <div className="stat-header">
                  <TrendingUp className="stat-icon green" />
                  <span className="stat-label">인기도</span>
                </div>
                <p className="stat-value">{movie.popularity.toFixed(1)}</p>
              </div>
            )}

            {typeof movie.revenue === "number" && (
              <div className="stat-card">
                <div className="stat-header">
                  <DollarSign className="stat-icon yellow" />
                  <span className="stat-label">총 수익</span>
                </div>
                <p className="stat-value">
                  ${(movie.revenue / 1_000_000).toFixed(1)}M
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}