// src/services/movieService.ts
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import type { MovieDetail } from "../types/movie";
import { enrichMovieData } from "./movies/posterApi";

// --------------------------------------------
// Firestore에 영화 데이터를 저장하는 함수
//  - TMDB 데이터(포스터, 평점 등)를 enrichMovieData()로 병합
//  - TMDB 정보가 없으면 Firestore에 저장하지 않고 "SKIPPED_TMDB" 반환
//  - 정상 저장 시 "SAVED", 오류 시 "ERROR" 반환
// --------------------------------------------
export const saveMovie = async (movie: MovieDetail): Promise<string> => {
  try {
    // TMDB 데이터 병합 (포스터, 평점, 줄거리 등 추가)
    const enriched = await enrichMovieData(movie);

    // TMDB 정보가 없을 경우 저장하지 않음
    // (예: 포스터 이미지나 평점이 없는 경우)
    if (!enriched.posterUrl || !enriched.rating) {
      console.log(`⏭️ TMDB 정보 없음: ${movie.title}`);
      return "SKIPPED_TMDB";
    }

    // Firestore에 영화 문서 저장 (merge 옵션으로 기존 데이터 덮어쓰기 방지)
    await setDoc(doc(db, "movies", enriched.id), enriched, { merge: true });

    // 성공 시 "SAVED" 반환
    return "SAVED";
  } catch (err) {
    console.error("❌ Firestore 저장 실패:", err);
    return "ERROR";
  }
};
