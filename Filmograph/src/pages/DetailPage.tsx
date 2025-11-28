// src/pages/DetailPage.tsx
import { useParams } from "react-router-dom";
import MovieHeader from "../features/movie/components/MovieHeader";
import useMovie from "../features/movie/hooks/useMovie";

import ScrollSection from "../features/movie/components/ScrollSection";
import OverviewSection from "../features/movie/components/OverviewSection";
import CrewSection from "../features/movie/components/CrewSection";
import CastSection from "../features/movie/components/CastSection";
import AwardsSection from "../features/movie/components/AwardsSection";
import VideosSection from "../features/movie/components/VideosSection";
import WatchProvidersSection from "../features/movie/components/WatchProvidersSection";
import GallerySection from "../features/movie/components/GallerySection";
import MovieGraphSection from "../features/movie/components/MovieGraphSection";
import RelatedMoviesSection from "../features/movie/components/RelatedMoviesSection";
import ReviewsSection from "../features/movie/components/ReviewsSection";

import useExpandedRelatedMovies from "../hooks/useRelatedMovies";

export default function DetailPage() {
  const { movieId } = useParams();
  const { movie, loading } = useMovie(movieId!);

  // 🔥 TMDB → KOBIS 강제 매칭 + Firestore 저장 + 확장 관련영화
  const { relatedMovies, loading: loadingRelated } =
    useExpandedRelatedMovies(movie);

  if (loading) return <div>불러오는 중...</div>;
  if (!movie) return <div>영화를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#0d5a5a] pt-20 overflow-x-hidden">
      <MovieHeader movie={movie} />

      <ScrollSection>
        <OverviewSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <CrewSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <CastSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <AwardsSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <WatchProvidersSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <VideosSection movie={movie} />
      </ScrollSection>

      <ScrollSection>
        <GallerySection movie={movie} />
      </ScrollSection>

      {/* 🔥 그래프는 DetailPage에서 확장된 relatedMovies만 사용 */}
      <ScrollSection>
        <MovieGraphSection movie={movie} relatedMovies={relatedMovies} />
      </ScrollSection>

      {/* 🔥 관련영화 역시 확장된 relatedMovies 사용 */}
      <ScrollSection>
        <RelatedMoviesSection
          movies={relatedMovies}
          loading={loadingRelated}
        />
      </ScrollSection>

      <ScrollSection>
        <ReviewsSection movie={movie} />
      </ScrollSection>
    </div>
  );
}
