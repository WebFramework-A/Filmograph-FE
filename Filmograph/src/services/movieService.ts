// src/services/movieService.ts
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import type { MovieDetail } from "../types/movie";
import { enrichMovieData } from "./movies/posterApi";
import { fetchMovieVideos } from "./movies/videoApi";
import { fetchWatchProviders } from "./movies/watchProviderApi";
import { cleanObject } from "../utils/cleanObject";

export const saveMovie = async (movie: MovieDetail): Promise<string> => {
  try {
    // KOBIS 필수 데이터
    if (
      !movie.title ||
      !movie.releaseDate ||
      !movie.directors?.length ||
      !movie.cast?.length ||
      !movie.genre?.length ||
      !movie.watchGrade ||
      !movie.nation
    ) {
      return "SKIPPED_KOBIS";
    }

    // 청불 제외
    if (movie.watchGrade.includes("청소년관람불가")) {
      return "SKIPPED_19";
    }

    // TMDB 병합
    const enriched = await enrichMovieData(movie);

    // TMDB 필수 데이터
    if (
      !enriched.posterUrl ||
      enriched.rating == null ||
      !enriched.overview ||
      enriched.popularity == null
    ) {
      return "SKIPPED_TMDB";
    }

    // 영상 데이터
    let videos = null;
    if (enriched.tmdbId) {
      videos = await fetchMovieVideos(enriched.tmdbId);
    }

    // OTT 제공처
    let watchProviders = null;
    if (enriched.tmdbId) {
      watchProviders = await fetchWatchProviders(enriched.tmdbId);
    }

    const fullyEnriched: MovieDetail = {
      ...enriched,
      videos: videos ?? undefined,
      watchProviders: watchProviders ?? undefined,
      updatedAt: new Date().toISOString(),
    };

    // undefined 모두 제거
    const finalData = cleanObject(fullyEnriched);

    // Firestore 저장
    await setDoc(doc(db, "movies", fullyEnriched.id), finalData, {
      merge: true,
    });

    return "SAVED";

  } catch (err) {
    console.error(" Firestore 저장 실패:", err);
    return "ERROR";
  }
};