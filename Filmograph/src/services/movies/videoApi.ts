// src/services/movies/videoApi.ts
// 유튜브 트레일러 / 클립 데이터
import axios from "axios";
import type { MovieVideos } from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export const fetchMovieVideos = async (
  tmdbId: number | string
): Promise<MovieVideos | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/videos`, {
      params: {
        api_key: TMDB_KEY,
        language: "ko-KR",
      },
    });

    const results = res.data?.results || [];

    return {
      trailers: results.filter((v: any) => v.type === "Trailer"),
      teasers: results.filter((v: any) => v.type === "Teaser"),
      clips: results.filter((v: any) => v.type === "Clip"),
    };
  } catch (err) {
    console.error("Video fetch error:", err);
    return null;
  }
};
