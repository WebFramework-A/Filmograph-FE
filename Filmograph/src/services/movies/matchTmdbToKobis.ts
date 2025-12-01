import axios from "axios";
import { fetchTMDBById } from "./tmdbApi";
import { db } from "../data/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { countKobisCall } from "../data/kobisUsage";

const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY;

const searchKobisMovies = async (query: string, year?: string) => {
  await countKobisCall();

  const url =
    "https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json";

  try {
    const res = await axios.get(url, {
      params: {
        key: KOBIS_KEY,
        movieNm: query,
        openStartDt: year,
        openEndDt: year,
      },
    });

    return res.data?.movieListResult?.movieList ?? [];
  } catch {
    return [];
  }
};

export const findKobisMovieCdByTmdbId = async (
  tmdbId: number
): Promise<string | null> => {
  
  const cacheRef = doc(db, "tmdbToKobis", String(tmdbId));
  const cacheSnap = await getDoc(cacheRef);

  if (cacheSnap.exists()) {
    return cacheSnap.data().kobisId ?? null;
  }

  const tmdb = await fetchTMDBById(tmdbId);
  if (!tmdb) return null;

  const titleKo = tmdb.title;
  const titleEn = tmdb.original_title;
  const year = tmdb.release_date?.slice(0, 4);

  let match: string | null = null;

  const list1 = await searchKobisMovies(titleKo, year);
  if (list1.length === 1) match = list1[0].movieCd;

  if (!match) {
    const list2 = await searchKobisMovies(titleEn, year);
    if (list2.length === 1) match = list2[0].movieCd;
  }

  if (!match) {
    const list3 = await searchKobisMovies(titleKo);
    const f1 = list3.filter((m: any) => m.prdtYear === year);
    if (f1.length === 1) match = f1[0].movieCd;
  }

  if (!match) {
    const list4 = await searchKobisMovies(titleEn);
    const f2 = list4.filter((m: any) => m.prdtYear === year);
    if (f2.length === 1) match = f2[0].movieCd;
  }

  await setDoc(cacheRef, { kobisId: match });

  return match;
};
