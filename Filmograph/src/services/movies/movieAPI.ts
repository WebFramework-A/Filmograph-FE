// src/services/movies/movie.ts
// KOBIS 오픈API에서 영화 목록 및 상세정보를 불러오는 모듈
import axios from "axios";
import type { MovieDetail } from "../../types/movie";

interface KobisGenre {
  genreNm: string;  // 장르
}
interface KobisNation {
  nationNm: string; // 제작국가
}
interface KobisDirector {
  peopleNm: string; // 감독 이름
}
interface KobisActor {
  peopleNm: string; // 배우 이름
}

//  KOBIS API 기본 설정
const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY;
const BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";

// 영화 목록 조회
export const fetchMovieList = async (page = 1, perPage = 100) => {
  const res = await axios.get(`${BASE_URL}/movie/searchMovieList.json`, {
    params: { key: KOBIS_KEY, curPage: page, itemPerPage: perPage },
  });

  return res.data?.movieListResult?.movieList || [];
};

// 관람등급 판별
const isAdultGrade = (watchGrade?: string): boolean => {
  if (!watchGrade) return false;
  return (
    watchGrade.includes("청소년") ||
    watchGrade.includes("제한") ||
    watchGrade.includes("19")
  );
};

// 영화 상세 조회
export const fetchMovieDetail = async (
  movieCd: string
): Promise<MovieDetail | null> => {
  const res = await axios.get(`${BASE_URL}/movie/searchMovieInfo.json`, {
    params: { key: KOBIS_KEY, movieCd },
  });

  const info = res.data?.movieInfoResult?.movieInfo;
  if (!info) return null;

  const genres: string[] =
    info.genres?.map((g: KobisGenre) => g.genreNm) ?? [];
  if (genres.some((g) => g.includes("드라마"))) {
    return null;
  }

  const watchGrade = info.audits?.[0]?.watchGradeNm;
  if (isAdultGrade(watchGrade)) {
    return null;
  }

  const data: MovieDetail = {
    id: info.movieCd,           // Firestore 문서 ID로 사용
    movieCd: info.movieCd,      // 영화코드
    title: info.movieNm,        // 한글제목
    titleEn: info.movieNmEn,    // 영문제목
    releaseDate: info.openDt,   // 개봉일 (YYYYMMDD)
    genre: genres,              // 장르명 배열
    nation: info.nations?.map((n: KobisNation) => n.nationNm).join(", "),   // 제작국가
    directors: info.directors?.map((d: KobisDirector) => ({
      name: d.peopleNm,
      role: "감독",
    })),
    cast: info.actors?.map((a: KobisActor) => ({
      name: a.peopleNm,
      role: "배우",
    })),
    watchGrade: watchGrade || "정보 없음",  // 관람등급
    runtime: info.showTm ? parseInt(info.showTm) : undefined,   // 상영시간(분)
    createdAt: new Date().toISOString(),    // 저장 시각
  };

  return data;
};
