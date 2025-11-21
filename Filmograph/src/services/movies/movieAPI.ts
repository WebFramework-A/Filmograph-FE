// KOBIS 오픈API에서 영화 목록 및 상세정보를 불러오는 모듈
//  - fetchMovieList() : 목록 조회
//  - fetchMovieDetail() : 상세 조회
// Firestore 저장 시 사용할 MovieDetail 타입으로 변환함
import axios from "axios";
import type { MovieDetail } from "../../types/movie";

//  KOBIS API 내부 응답 구조 타입 정의 (로컬 전용)
interface KobisGenre {
  genreNm: string;  // 장르명 (예: "드라마", "액션")
}
interface KobisNation {
  nationNm: string; // 제작국가명 (예: "한국")
}
interface KobisDirector {
  peopleNm: string; // 감독 이름
}
interface KobisActor {
  peopleNm: string; // 배우 이름
}

//  KOBIS API 기본 설정
const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY; // .env에 저장된 인증키
const BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";

/* 영화 목록 조회
    - 한 페이지당 최대 100개까지 영화 목록을 반환
    - 반환 데이터: [{ movieCd, movieNm, prdtYear, openDt, ... }]
*/
export const fetchMovieList = async (page = 1, perPage = 100) => {
  const res = await axios.get(`${BASE_URL}/movie/searchMovieList.json`, {
    params: { key: KOBIS_KEY, curPage: page, itemPerPage: perPage },
  });

  // 데이터가 없을 경우 빈 배열 반환
  return res.data?.movieListResult?.movieList || [];
};

/** 관람등급이 19금인지 판별 */
const isAdultGrade = (watchGrade?: string): boolean => {
  if (!watchGrade) return false;
  return (
    watchGrade.includes("청소년") ||
    watchGrade.includes("제한") ||
    watchGrade.includes("19")
  );
};

/* 영화 상세 조회
    - movieCd(영화코드)를 기반으로 상세정보 조회
    - 드라마 장르 / 19금 영화는 여기서 1차 필터링
*/
export const fetchMovieDetail = async (
  movieCd: string
): Promise<MovieDetail | null> => {
  const res = await axios.get(`${BASE_URL}/movie/searchMovieInfo.json`, {
    params: { key: KOBIS_KEY, movieCd },
  });

  // 응답 데이터에서 영화 상세 정보 추출
  const info = res.data?.movieInfoResult?.movieInfo;
  if (!info) return null;

  // 1) 장르에 '드라마'가 포함된 작품은 제외 (요구사항)
  const genres: string[] =
    info.genres?.map((g: KobisGenre) => g.genreNm) ?? [];
  if (genres.some((g) => g.includes("드라마"))) {
    console.log(` 장르=드라마 → 제외: ${info.movieNm}`);
    return null;
  }

  // 2) 관람등급이 청소년 관람불가(19금)인 경우 제외
  const watchGrade = info.audits?.[0]?.watchGradeNm;
  if (isAdultGrade(watchGrade)) {
    console.log(` 19금(관람등급=${watchGrade}) → 제외: ${info.movieNm}`);
    return null;
  }

  // 3) KOBIS 데이터를 MovieDetail 구조에 맞게 매핑
  const data: MovieDetail = {
    id: info.movieCd,           // Firestore 문서 ID로 사용
    movieCd: info.movieCd,      // 영화코드
    title: info.movieNm,        // 한글제목
    titleEn: info.movieNmEn,    // 영문제목
    releaseDate: info.openDt,   // 개봉일 (YYYYMMDD)
    genre: genres,              // 장르명 배열
    nation: info.nations?.map((n: KobisNation) => n.nationNm).join(", "),   // 제작국가 문자열
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
