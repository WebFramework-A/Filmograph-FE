// src/services/movies/tmdbApi.ts
import axios from "axios";
import type { MovieDetail, MovieImages } from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

const JOB_TRANSLATION: Record<string, string> = {
  Director: "감독",

  Writer: "각본",
  Screenplay: "각본",
  Story: "스토리",

  Producer: "제작",
  "Executive Producer": "총괄 제작",
  "Co-Producer": "공동 제작",

  "Original Music Composer": "음악",
  Composer: "음악",

  "Director of Photography": "촬영",
  Cinematography: "촬영",

  Editor: "편집",
  "Film Editor": "편집",

  "Art Direction": "미술",
  "Production Design": "미술",

  "Costume Designer": "의상",

  "Sound Designer": "음향",
  "Sound Editor": "음향",

  "Visual Effects Supervisor": "VFX",
  "Animation Supervisor": "애니메이션",
};

const translateJob = (job: string): string =>
  JOB_TRANSLATION[job] ?? job;

const CREW_CATEGORY_RULES: Record<string, string> = {
  Director: "directors",

  Writer: "writers",
  Screenplay: "writers",
  Story: "writers",

  Producer: "producers",
  "Executive Producer": "producers",
  "Co-Producer": "producers",

  "Original Music Composer": "music",
  Composer: "music",

  "Director of Photography": "camera",
  Cinematography: "camera",

  Editor: "editing",
  "Film Editor": "editing",

  "Art Direction": "art",
  "Production Design": "art",

  "Costume Designer": "costume",

  "Sound Designer": "sound",
  "Sound Editor": "sound",

  "Visual Effects Supervisor": "vfx",
  "Animation Supervisor": "vfx",
};

const mapJobToCategory = (job: string): string | null =>
  CREW_CATEGORY_RULES[job] ?? null;

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

    return res.data?.results?.find((item: any) => item.media_type === "movie") ?? null;
  } catch (err) {
    console.error("TMDB 검색 실패:", err);
    return null;
  }
};

const fetchTMDBImages = async (tmdbId: number): Promise<MovieImages | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/images`, {
      params: { api_key: TMDB_KEY },
    });

    return {
      backdrops:
        res.data?.backdrops?.map(
          (img: any) => `https://image.tmdb.org/t/p/original${img.file_path}`
        ) || [],
      posters:
        res.data?.posters?.map(
          (img: any) => `https://image.tmdb.org/t/p/w500${img.file_path}`
        ) || [],
    };
  } catch (err) {
    console.error("TMDB 이미지 오류:", err);
    return null;
  }
};

const fetchTMDBCredits = async (tmdbId: number) => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/credits`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });
    return res.data ?? {};
  } catch (err) {
    console.error("TMDB Credits 오류:", err);
    return { cast: [], crew: [] };
  }
};

const fetchTMDBVideos = async (tmdbId: number) => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/videos`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });

    const list = res.data?.results || [];

    return {
      trailers: list.filter((v: any) => v.type === "Trailer"),
      teasers: list.filter((v: any) => v.type === "Teaser"),
      clips: list.filter((v: any) => v.type === "Clip"),
    };
  } catch (err) {
    console.error("TMDB Videos 오류:", err);
    return null;
  }
};

const fetchTMDBWatchProviders = async (tmdbId: number) => {
  try {
    const res = await axios.get(
      `${TMDB_BASE}/movie/${tmdbId}/watch/providers`,
      { params: { api_key: TMDB_KEY } }
    );

    const kr = res.data?.results?.KR;

    if (!kr) return null;

    const providers: any[] = [];

    const mapProviders = (list: any[], type: "flatrate" | "rent" | "buy") => {
      if (Array.isArray(list))
        list.forEach((p) =>
          providers.push({
            providerName: p.provider_name,
            logoUrl: `https://image.tmdb.org/t/p/w200${p.logo_path}`,
            type,
          })
        );
    };

    mapProviders(kr.flatrate, "flatrate");
    mapProviders(kr.rent, "rent");
    mapProviders(kr.buy, "buy");

    return providers.length > 0 ? providers : null;
  } catch {
    return null;
  }
};

export const enrichMovieData = async (movie: MovieDetail): Promise<MovieDetail> => {
  try {
    const tmdb = await fetchMovieFromTMDB(movie.title, movie.releaseDate);
    if (!tmdb) return movie;

    const tmdbId = tmdb.id;

    const [tmdbDetail, images, videos, providers, credits] = await Promise.all([
      axios
        .get(`${TMDB_BASE}/movie/${tmdbId}`, {
          params: { api_key: TMDB_KEY, language: "ko-KR" },
        })
        .then((r) => r.data)
        .catch(() => null),
      fetchTMDBImages(tmdbId),
      fetchTMDBVideos(tmdbId),
      fetchTMDBWatchProviders(tmdbId),
      fetchTMDBCredits(tmdbId),
    ]);

    const cast =
      credits?.cast?.map((c: any) => ({
        name: c.name,
        character: c.character,
        role: "배우",
        profileUrl: c.profile_path
          ? `https://image.tmdb.org/t/p/w500${c.profile_path}`
          : undefined,
      })) || movie.cast;

    // 카테고리 그룹화
    const groupedCrew: any = {
      directors: [],
      writers: [],
      producers: [],
      music: [],
      camera: [],
      editing: [],
      art: [],
      costume: [],
      sound: [],
      vfx: [],
    };

    credits?.crew?.forEach((c: any) => {
      const category = mapJobToCategory(c.job);
      if (!category) return;

      groupedCrew[category].push({
        name: c.name,
        role: translateJob(c.job),
      });
    });

    return {
      ...movie,
      tmdbId,

      posterUrl: tmdb.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
        : movie.posterUrl,
      backdropUrl: tmdb.backdrop_path
        ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}`
        : movie.backdropUrl,
      overview: tmdbDetail?.overview ?? movie.overview,

      rating: tmdbDetail?.vote_average ?? movie.rating,
      voteCount: tmdbDetail?.vote_count ?? movie.voteCount,
      popularity: tmdbDetail?.popularity ?? movie.popularity,
      revenue: tmdbDetail?.revenue ?? movie.revenue,

      images: images || movie.images,
      videos: videos || movie.videos,
      watchProviders: providers || movie.watchProviders,

      cast,
      ...groupedCrew,

      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ enrichMovieData 오류:", err);
    return movie;
  }
};