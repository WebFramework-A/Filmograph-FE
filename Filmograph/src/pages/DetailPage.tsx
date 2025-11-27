// pages/DetailPage.tsx
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

export default function DetailPage() {
  const { movieId } = useParams();
  const { movie, loading } = useMovie(movieId!);

  if (loading) return <div>불러오는 중...</div>;
  if (!movie) return <div>영화를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#0b4747] pt-20 overflow-x-hidden">
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

      <ScrollSection>
        <MovieGraphSection movieId={movie.id} />
      </ScrollSection>

      <ScrollSection>
        <RelatedMoviesSection relatedIds={movie.relatedMovies ?? []} />
      </ScrollSection>

      <ScrollSection>
        <ReviewsSection movie={movie} />
      </ScrollSection>

      <pre className="text-white p-6">{JSON.stringify(movie, null, 2)}</pre>
    </div>
  );
}