// src/services/movies/movie.ts
import axios from "axios";
import type { MovieDetail } from "../../types/movie";

interface KobisGenre {
  genreNm: string; // 장르
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

const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY as string;
const BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";

// 영화 목록
export const fetchMovieList = async (page = 1, perPage = 100) => {
  const res = await axios.get(`${BASE_URL}/movie/searchMovieList.json`, {
    params: { key: KOBIS_KEY, curPage: page, itemPerPage: perPage },
  });

  return res.data?.movieListResult?.movieList || [];
};

// 관람등급
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

  // 장르
  if (genres.some((g) => g.includes("드라마"))) {
    return null;
  }

  const watchGrade = info.audits?.[0]?.watchGradeNm;
  if (isAdultGrade(watchGrade)) {
    return null;
  }

  // 누적 관객 수
  const rawAudience = (info as any).audiAcc;
  const audienceCount =
    typeof rawAudience === "string" && rawAudience.trim().length > 0
      ? Number(rawAudience)
      : undefined;

  const data: MovieDetail = {
    // MovieBase
    id: info.movieCd, // Firestore 문서 ID로 사용
    movieCd: info.movieCd, // 영화코드
    title: info.movieNm, // 한글제목
    titleEn: info.movieNmEn, // 영문제목
    releaseDate: info.openDt, // 개봉일 (YYYYMMDD)
    genre: genres, // 장르명 배열
    nation: info.nations
      ?.map((n: KobisNation) => n.nationNm)
      .join(", "), // 제작국가
    runtime: info.showTm ? parseInt(info.showTm, 10) : undefined,

    // Credits (감독/배우)
    directors: info.directors?.map((d: KobisDirector) => ({
      name: d.peopleNm,
      role: "감독",
    })),
    cast: info.actors?.map((a: KobisActor) => ({
      name: a.peopleNm,
      role: "배우",
    })),

    // 관람등급
    watchGrade: watchGrade || "정보 없음",

    // 누적 관객 수
    audienceCount,

    createdAt: new Date().toISOString(),
    poster: null,
    openDt: undefined
  };

  return data;
};