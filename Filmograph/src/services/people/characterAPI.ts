// src/services/people/characterAPI.ts
import axios from "axios";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE = "https://api.themoviedb.org/3";

// TMDB에서 우리가 실제로 쓸 최소 정보
export interface TmdbPersonSimple {
  id: number;
  name: string;
  profileImage: string | null; // full URL
}

export interface TmdbCharacterRole {
  movieId: number;
  movieTitle: string;
  characterName: string;
}

// TMDB cast 응답 중에서 우리가 쓰는 필드만 타입 정의
interface TmdbCastItem {
  id: number;
  title?: string;
  name?: string;
  character?: string;
}

/* 이름으로 사람 검색
  - TMDB person 검색해서 id + 프로필이미지(full URL)만 반환
*/
export async function searchPersonSimple(
  name: string
): Promise<TmdbPersonSimple | null> {
  if (!name) return null;

  try {
    const res = await axios.get(`${TMDB_BASE}/search/person`, {
      params: {
        api_key: TMDB_KEY,
        query: name,
        language: "ko-KR",
        include_adult: false,
      },
    });

    const first = res.data?.results?.[0];
    if (!first) return null;

    return {
      id: first.id,
      name: first.name,
      profileImage: first.profile_path
        ? `https://image.tmdb.org/t/p/w500${first.profile_path}`
        : null,
    };
  } catch (error) {
    console.error("TMDB searchPersonSimple 오류:", error);
    return null;
  }
}

/* TMDB person id로 캐릭터(배역) 목록 가져오기
  - 영화/TV 구분 안 하고 character(배역명) 있는 것만 추림
*/
export async function fetchCharacterRoles(
  personId: number
): Promise<TmdbCharacterRole[]> {
  try {
    const res = await axios.get(
      `${TMDB_BASE}/person/${personId}/combined_credits`,
      {
        params: {
          api_key: TMDB_KEY,
          language: "ko-KR",
        },
      }
    );

    const cast: TmdbCastItem[] = res.data?.cast || [];

    return cast
      .filter((c) => !!c.character) // 배역 이름 있는 것만
      .map((c) => ({
        movieId: c.id,
        movieTitle: c.title || c.name || "",
        characterName: c.character as string,
      }));
  } catch (error) {
    console.error("TMDB fetchCharacterRoles 오류:", error);
    return [];
  }
}
