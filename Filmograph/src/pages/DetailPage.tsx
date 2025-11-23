// pages/DetailPage.tsx
import { useParams } from "react-router-dom";
import MovieHeader from "../features/movie/components/MovieHeader";
import useMovie from "../features/movie/hooks/useMovie";
import ScrollSection from "../features/movie/components/ScrollSection";
import OverviewSection from "../features/movie/components/OverviewSection";
import CrewSection from "../features/movie/components/CrewSection";
import CastSection from "../features/movie/components/CastSection";

export default function DetailPage() {
  const { movieId } = useParams();
  const { movie, loading } = useMovie(movieId!);

  if (loading) return <div>불러오는 중...</div>;
  if (!movie) return <div>영화를 찾을 수 없습니다.</div>;
  
  return (
    <div className="min-h-screen bg-[#00696B]">
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
      <pre>{JSON.stringify(movie, null, 2)}</pre>
    </div>
    
  );
}