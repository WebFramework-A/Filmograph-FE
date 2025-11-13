// 영화 데이터 타입 정의 (KOBIS + TMDB)

// 영화 기본 정보
//  - 영화의 식별자, 제목, 개봉일, 기본 메타데이터 등
export interface MovieBase {
  id: string;                 // Firestore 문서 ID (movieCd와 동일)
  movieCd: string;            // KOBIS 고유 영화 코드
  title: string;              // 영화 제목 (국문)
  titleEn?: string;           // 영화 제목 (영문)
  originalTitle?: string;     // 원제 (해외영화의 원어 제목)
  releaseDate?: string;       // 개봉일 (YYYY-MM-DD)
  genre?: string[];           // 장르 목록 (ex. ["드라마", "스릴러"])
  nation?: string;            // 제작국가 (ex. "한국")
  language?: string;          // 언어 (ex. "한국어")
  runtime?: number;           // 상영시간 (분)
  overview?: string;          // 줄거리 / 소개
  posterUrl?: string;         // 포스터 이미지 URL
  backdropUrl?: string;       // 배경 이미지 URL (TMDB 백드롭)
}

// 인물 정보
//  - 역할(role): 감독, 각본가, 배우, 프로듀서
export interface Person {
  id?: string;                // TMDB 또는 Firestore 내 인물 고유 ID
  name: string;               // 이름
  role?: string;              // 역할 (감독, 배우, 작곡가 등)
  character?: string;         // 배우일 경우 배역 이름
  profileUrl?: string;        // 인물 프로필 이미지 URL
}

// 영화 제작진 정보
//  - 인물 타입(Person)을 활용해 감독, 제작자, 배우 등을 분류
export interface MovieCredits {
  directors?: Person[];       // 감독 목록
  producers?: Person[];       // 제작자 목록
  writers?: Person[];         // 각본가 / 시나리오 작가 목록
  cast?: Person[];            // 출연 배우 목록
}

// 영화 통계 / 흥행 데이터
//  - 평점, 인기 지수, 관객 수, 흥행 수익 등을 저장
export interface MovieStats {
  rating?: number;            // 평균 평점 (0~10, TMDB 기준)
  voteCount?: number;         // 평점 투표 수 (TMDB)
  popularity?: number;        // TMDB 인기 지수
  audienceCount?: number;     // 누적 관객 수 (KOBIS)
  revenue?: number;           // 총 흥행 수익 (달러 단위, TMDB)
  achievements?: string;      // 요약 성과 문장 (평점, 흥행, 수상 등 영화의 대표 성과를 한 줄 요약)
}

// 수상 내역 및 관련 영화
export interface Award {
  name: string;                     // 상 이름 (예: "아카데미 시상식")
  year?: number;                    // 수상 연도
  category?: string;                // 부문명 (예: "작품상", "감독상")
  result?: "Winner" | "Nominee";    // 수상 여부
}

export interface MovieAwards {
  awards?: Award[];           // 수상 내역 배열
  relatedMovies?: string[];   // 관련 영화 ID 배열
}

// 최종 통합 타입
export interface MovieDetail
  extends MovieBase, MovieCredits, MovieStats, MovieAwards {
  watchGrade?: string;      // 관람 연령
  createdAt?: string;       // Firestore에 최초로 저장된 시각
  updatedAt?: string;       // Firestore 데이터 갱신 시각
}
