// pages/DetailPage.tsx
import { useParams } from "react-router-dom";
import MovieHeader from "../features/movie/components/MovieHeader";
import useMovie from "../features/movie/hooks/useMovie";

export default function DetailPage() {
  const { movieId } = useParams();
  const { movie, loading } = useMovie(movieId!);

  if (loading) return <div>불러오는 중...</div>;
  if (!movie) return <div>영화를 찾을 수 없습니다.</div>;
  
  return (
  <div className="min-h-screen bg-[#00696B]">
    <MovieHeader movie={movie} />

    <h3 className="text-white mt-10 ml-6">데이터 프리뷰</h3>
    <pre className="text-white p-6">{JSON.stringify(movie, null, 2)}</pre>
  </div>
  );
}