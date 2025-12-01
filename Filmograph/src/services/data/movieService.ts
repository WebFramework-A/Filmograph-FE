import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import type { MovieDetail } from "../../types/movie";
import { enrichMovieData } from "./../movies/tmdbApi";
import { cleanObject } from "../../utils/cleanObject";

type SaveMovieResult =
  | "SAVED"
  | "SKIPPED_KOBIS"
  | "SKIPPED_19"
  | "SKIPPED_TMDB"
  | "ERROR";

export const saveMovie = async (movie: MovieDetail): Promise<SaveMovieResult> => {
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

    // TMDB 데이터 병합
    const enriched = await enrichMovieData(movie);

    // TMDB 필수 데이터 확인
    if (
      !enriched.posterUrl ||
      enriched.rating == null ||
      !enriched.overview ||
      enriched.popularity == null
    ) {
      return "SKIPPED_TMDB";
    }

    const finalMovie: MovieDetail = {
      ...enriched,
      updatedAt: new Date().toISOString(),
    };

    // undefined / null 제거
    const finalData = cleanObject(finalMovie);

    // Firestore 저장
    await setDoc(doc(db, "movies", finalMovie.id), finalData, { merge: true });

    return "SAVED";
  } catch (err) {
    console.error("Firestore 저장 실패:", err);
    return "ERROR";
  }
};