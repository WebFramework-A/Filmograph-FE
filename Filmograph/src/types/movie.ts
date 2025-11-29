/** 영화 기본 정보 */
export interface MovieBase {
  id: string;                 // Firestore 문서 ID (movieCd 동일)
  movieCd: string;            // KOBIS 영화 코드
  title: string;              // 한국어 제목
  titleEn?: string;           // 영어 제목
  originalTitle?: string;     // 원제
  releaseDate?: string;       // YYYYMMDD
  genre?: string[];           // 장르
  nation?: string;            // 제작국가
  language?: string;          // 언어
  runtime?: number;           // 상영시간 (분)
  overview?: string;          // 줄거리
  posterUrl?: string;         // 포스터
  backdropUrl?: string;       // 배경 이미지
  watchGrade?: string;        // 관람등급
}

/** 인물 정보 */
export interface Person {
  id?: string;                // TMDB person_id
  name: string;               // 이름
  role?: string;              // (감독/배우/작곡/각색 등)
  character?: string;         // 배역명
  profileUrl?: string;        // 프로필 이미지
}

/** 영화 제작진 정보 */
export interface MovieCredits {
  directors?: Person[];       // 감독
  writers?: Person[];         // 각본가
  producers?: Person[];       // 제작자
  cast?: Person[];            // 배우
}

/** 영화 통계 */
export interface MovieStats {
  rating?: number;            // 평균 평점 (0~10)
  voteCount?: number;         // 투표 수
  popularity?: number;        // TMDB 인기 지수
  audienceCount?: number;     // 누적 관객 수 (KOBIS)
  revenue?: number;           // 수익 (TMDB)
  achievements?: string;      // 한 줄 요약 성과
  avgRating?: number;         // 사이트 내 평균 평점
}

/** 수상 내역 */
export interface Award {
  name: string;
  year?: number;
  category?: string;
  result?: "Winner" | "Nominee";
}

export interface MovieAwards {
  awards?: Award[];
  relatedMovies?: string[];   // 관련 영화 IDs
}

/** OTT 시청 가능 경로 */
export interface WatchProvider {
  providerName: string;       // 예: "Netflix", "Disney Plus"
  logoUrl?: string;           // 로고 URL
  type: "flatrate" | "rent" | "buy";  // 구독 / 대여 / 구매
}

/** 영상(트레일러, 티저 등) */
export interface MovieVideo {
  key: string;                // YouTube key
  site: string;               // YouTube, Vimeo
  name: string;               // 영상 제목
  type: string;               // Trailer/Clip/Teaser
}

export interface MovieVideos {
  trailers?: MovieVideo[];
  teasers?: MovieVideo[];
  clips?: MovieVideo[];
}

/** 영화 이미지 갤러리 */
export interface MovieImages {
  backdrops?: string[];       // 배경 이미지 리스트
  posters?: string[];         // 포스터 이미지 리스트
}

/** 최종 통합 타입 */
export interface MovieDetail
  extends MovieBase,
  MovieCredits,
  MovieStats,
  MovieAwards {
  poster: null;
  openDt: any;

  tmdbId?: number;
  watchProviders?: WatchProvider[];     // OTT 제공처
  videos?: MovieVideos;                 // 트레일러/영상
  images?: MovieImages;                 // 스틸컷/포스터 갤러리

  // 메타 정보
  createdAt?: string;
  updatedAt?: string;
}