import { useParams } from "react-router-dom";
import useMovie from "../features/movie/hooks/useMovie";

export default function DetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const { movie, loading } = useMovie(movieId!);

  if (loading) return <div>불러오는 중...</div>;
  if (!movie) return <div>영화 데이터를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{movie.title}</h1>
      <p>영문 제목: {movie.titleEn}</p>
      <p>개봉일: {movie.releaseDate}</p>
      <p>장르: {movie.genre?.join(", ")}</p>
      <img src={movie.posterUrl} alt="poster" width={300} />
      
      <h3>전체 JSON 데이터</h3>
      <pre>{JSON.stringify(movie, null, 2)}</pre>
    </div>
  );
}
