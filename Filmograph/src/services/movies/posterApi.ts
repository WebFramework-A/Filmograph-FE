// src/services/movies/posterApi.ts
// TMDB API에서 포스터, 평점, 줄거리, 이미지(갤러리)까지 모두 가져오는 통합 모듈
import axios from "axios";
import type { MovieDetail, MovieImages } from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * TMDB 멀티 검색 (movie, tv, person 등)
 *  - media_type === "movie" 인 결과만 사용
 */
export const fetchMovieFromTMDB = async (title: string, year?: string) => {
  try {
    const res = await axios.get(`${TMDB_BASE}/search/multi`, {
      params: {
        api_key: TMDB_KEY,
        query: title,
        year: year?.substring(0, 4),
        language: "ko-KR",
      },
    });

    const results = res.data?.results || [];

    // movie 타입만 선택 (tv, person 제외)
    const movieResult = results.find(
      (item: any) => item.media_type === "movie"
    );

    if (!movieResult) {
      console.warn(`TMDB에서 영화(type=movie) 결과 없음: ${title}`);
      return null;
    }

    return movieResult;
  } catch (err) {
    console.error("TMDB 검색 실패:", err);
    return null;
  }
};

/** TMDB 이미지 API (backdrops + posters) */
const fetchTMDBImages = async (tmdbId: number): Promise<MovieImages | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/images`, {
      params: {
        api_key: TMDB_KEY,
      },
    });

    const backdrops = res.data?.backdrops?.map(
      (img: any) => `https://image.tmdb.org/t/p/original${img.file_path}`
    );

    const posters = res.data?.posters?.map(
      (img: any) => `https://image.tmdb.org/t/p/w500${img.file_path}`
    );

    return {
      backdrops: backdrops || [],
      posters: posters || [],
    };
  } catch (err) {
    console.error("TMDB 이미지 목록 오류:", err);
    return null;
  }
};

/** TMDB 정보 병합 */
export const enrichMovieData = async (movie: MovieDetail): Promise<MovieDetail> => {
  // 1) TMDB 데이터 찾기 (영화만)
  const tmdb = await fetchMovieFromTMDB(movie.title, movie.releaseDate);

  if (!tmdb) {
    console.warn(`TMDB 결과 없음 → ${movie.title}`);
    return movie;
  }

  const tmdbId: number = tmdb.id;

  // 2) 이미지 목록 가져오기 (스틸컷/포스터 갤러리)
  const images = await fetchTMDBImages(tmdbId);

  // 3) TMDB + 이미지 통합
  return {
    ...movie,
    tmdbId, // MovieDetail에 tmdbId 필드가 있다고 가정

    // 포스터 / 백드롭
    posterUrl: tmdb.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
      : movie.posterUrl,
    backdropUrl: tmdb.backdrop_path
      ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}`
      : movie.backdropUrl,

    // 평점/줄거리/인기도
    rating: tmdb.vote_average ?? movie.rating,
    voteCount: tmdb.vote_count ?? movie.voteCount,
    popularity: tmdb.popularity ?? movie.popularity,
    overview: tmdb.overview ?? movie.overview,

    // 이미지 갤러리 통합
    images: images || movie.images,

    // 메타
    updatedAt: new Date().toISOString(),
  };
};
