// src/services/movies/posterApi.ts 
// ------------------------------------------------------------
// TMDB API를 사용해 영화의 포스터, 평점, 줄거리 데이터를 가져오는 모듈
//  - TMDB(https://www.themoviedb.org/)의 영화 검색 및 상세정보 API를 활용
//  - fetchMovieFromTMDB(): 영화 제목을 기반으로 TMDB 영화 검색
//  - enrichMovieData(): 기존 MovieDetail 객체에 TMDB 데이터(포스터, 평점, 줄거리 등) 추가
// ------------------------------------------------------------
import axios from "axios";
import type { MovieDetail } from "../../types/movie";

// TMDB API 기본 설정
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/* ------------------------------------------------------------
    TMDB 영화 검색 (fetchMovieFromTMDB)
     - 영화 제목(한글)을 기반으로 TMDB 검색 API 호출
        @param {string} title   검색할 영화 제목
        @param {string} year    개봉연도
        @returns {Promise<any>} TMDB의 검색 결과 중 첫 번째 영화 객체 반환 (없으면 null)
   ------------------------------------------------------------ */
export const fetchMovieFromTMDB = async (title: string, year?: string) => {
    try {
        // TMDB 검색 API 요청
        const res = await axios.get(`${TMDB_BASE}/search/movie`, {
        params: {
            api_key: TMDB_KEY,
            query: title,
            year: year?.substring(0, 4),
            language: "ko-KR",
        },
        });
    
        // 검색 결과 중 첫 번째 영화 객체 반환 (없으면 null)
        return res.data.results?.[0] || null;
    } catch (err) {
        console.error("TMDB 검색 실패:", err);
        return null;
    }
};

/* ------------------------------------------------------------
    TMDB 데이터로 MovieDetail 보강
     - 기존 KOBIS 데이터에 TMDB 정보를 추가
     - posterUrl, backdropUrl, rating, voteCount, popularity, overview, updatedAt 추가
        @param {MovieDetail} movie   기존 KOBIS 기반 영화 데이터
        @returns {Promise<MovieDetail>} TMDB 정보가 병합된 새로운 MovieDetail 객체
   ------------------------------------------------------------ */
export const enrichMovieData = async (movie: MovieDetail): Promise<MovieDetail> => {
    // TMDB에서 영화 검색
    const tmdb = await fetchMovieFromTMDB(movie.title, movie.releaseDate);

    // 검색 결과가 없을 경우 원본 데이터 그대로 반환
    if (!tmdb) {
        console.warn(`TMDB 결과 없음: ${movie.title}`);
        return movie;
    }

  // TMDB 데이터가 존재하면 MovieDetail에 병합
    return {
        ...movie,
        posterUrl: tmdb.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : undefined,         // 포스터 이미지
        backdropUrl: tmdb.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}` : undefined,   // 배경 이미지 
        rating: tmdb.vote_average,      // 평균 평점
        voteCount: tmdb.vote_count,     // 평점 참여 수
        popularity: tmdb.popularity,    // 인기 지수
        overview: tmdb.overview,        // 줄거리 / 시놉시스
        updatedAt: new Date().toISOString(),    // 데이터 갱신 시각
    };
};