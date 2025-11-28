// src/hooks/useExpandedRelatedMovies.ts
import { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { findKobisMovieCdByTmdbId } from "../services/movies/matchTmdbToKobis";
import { fetchMovieDetail } from "../services/movies/movieAPI";
import { saveMovie } from "../services/movieService";
import type { MovieDetail } from "../types/movie";

export default function useExpandedRelatedMovies(movie: MovieDetail | null) {
  const [expanded, setExpanded] = useState<MovieDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie || !movie.relatedMovies) {
      setExpanded([]);
      setLoading(false);
      return;
    }

    async function load() {
      const results: MovieDetail[] = [];

      for (const rid of movie.relatedMovies.slice(0, 15)) {
        const kobisId = await findKobisMovieCdByTmdbId(Number(rid));
        if (!kobisId) continue;

        const ref = doc(db, "movies", kobisId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          results.push({ id: kobisId, ...snap.data() } as MovieDetail);
          continue;
        }

        const detail = await fetchMovieDetail(kobisId);
        if (!detail) continue;

        const saveResult = await saveMovie(detail);
        if (saveResult !== "SAVED") continue;

        const snap2 = await getDoc(ref);
        if (snap2.exists()) {
          results.push({ id: kobisId, ...snap2.data() } as MovieDetail);
        }
      }

      setExpanded(results);
      setLoading(false);
    }

    load();
  }, [movie]);

  return { relatedMovies: expanded, loading };
}
