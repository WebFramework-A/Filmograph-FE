// Firestore에서 movies/{id} 가져오는 훅
import { useEffect, useState } from "react";
import { type MovieDetail } from "../../../types/movie";
import { getMovie } from "../services/getMovie";

export default function useMovie(movieId: string) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      const data = await getMovie(movieId);
      setMovie(data);
      setLoading(false);
    }

    fetchMovie();
  }, [movieId]);

  return { movie, loading };
}
