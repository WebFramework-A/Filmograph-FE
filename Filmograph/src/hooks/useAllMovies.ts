import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/data/firebaseConfig";
import { type MovieDetail } from "../types/movie";

export default function useAllMovies() {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movies"));

        const movieList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            avgRating: data.avgRating || data.rating,
          };
        }) as unknown as MovieDetail[];

        setMovies(movieList);
      } catch (error) {
        console.error("영화 전체 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { movies, loading };
}
