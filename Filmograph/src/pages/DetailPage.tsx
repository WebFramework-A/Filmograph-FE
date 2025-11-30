// src/pages/DetailPage.tsx
import { useParams } from "react-router-dom";
import MovieHeader from "../components/DetailPage/MovieHeader";
import useMovie from "../hooks/useMovie";

import ScrollSection from "../components/DetailPage/ScrollSection";
import OverviewSection from "../components/DetailPage/OverviewSection";
import CrewSection from "../components/DetailPage/CrewSection";
import CastSection from "../components/DetailPage/CastSection";
import AwardsSection from "../components/DetailPage/AwardsSection";
import VideosSection from "../components/DetailPage/VideosSection";
import WatchProvidersSection from "../components/DetailPage/WatchProvidersSection";
import GallerySection from "../components/DetailPage/GallerySection";
import MovieGraphSection from "../components/DetailPage/MovieGraphSection";
import RelatedMoviesSection from "../components/DetailPage/RelatedMoviesSection";
import ReviewsSection from "../components/DetailPage/ReviewsSection";

import useExpandedRelatedMovies from "../hooks/useRelatedMovies";

export default function DetailPage() {
  const { movieId } = useParams();
  const { movie, loading } = useMovie(movieId!);

  const { relatedMovies, loading: loadingRelated } =
    useExpandedRelatedMovies(movie);

  if (loading)     
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div className="text-white text-xl font-semibold">
          불러오는 중 · · ·
        </div>
      </div>
    );
  if (!movie) 
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div className="text-white text-xl font-semibold">
          영화를 찾을 수 없습니다.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b4747] pt-20">
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
        <MovieGraphSection movie={movie} relatedMovies={relatedMovies} />
      </ScrollSection>

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
