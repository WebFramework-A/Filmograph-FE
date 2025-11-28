// src/services/movies/tmdbApi.ts
import axios from "axios";
import type {
  MovieDetail,
  MovieImages,
  MovieVideos,
  WatchProvider,
  Award,
  Person,
} from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE = "https://api.themoviedb.org/3";

const IMAGE_BASE_ORIGINAL = "https://image.tmdb.org/t/p/original";
const IMAGE_BASE_POSTER = "https://image.tmdb.org/t/p/w500";
const IMAGE_BASE_LOGO = "https://image.tmdb.org/t/p/w200";

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

const translateJob = (job: string): string => JOB_TRANSLATION[job] ?? job;

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
        year: year?.slice(0, 4),
        language: "ko-KR",
      },
    });

    return res.data?.results?.find((item: any) => item.media_type === "movie") ?? null;
  } catch {
    return null;
  }
};

const fetchTMDBImages = async (tmdbId: number): Promise<MovieImages | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/images`, {
      params: { api_key: TMDB_KEY },
    });

    return {
      backdrops: res.data?.backdrops?.map((i: any) => `${IMAGE_BASE_ORIGINAL}${i.file_path}`) ?? [],
      posters: res.data?.posters?.map((i: any) => `${IMAGE_BASE_POSTER}${i.file_path}`) ?? [],
    };
  } catch {
    return null;
  }
};

const fetchTMDBCredits = async (tmdbId: number) => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/credits`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });

    return res.data ?? { cast: [], crew: [] };
  } catch {
    return { cast: [], crew: [] };
  }
};

const fetchTMDBVideos = async (tmdbId: number): Promise<MovieVideos | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/videos`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });

    const list: any[] = res.data?.results ?? [];

    const mapped = list
      .filter((v) => v.key)
      .map((v) => ({
        key: v.key,
        site: v.site,
        name: v.name,
        type: v.type,
      }));

    return {
      trailers: mapped.filter((v) => v.type === "Trailer"),
      teasers:  mapped.filter((v) => v.type === "Teaser"),
      clips:    mapped.filter((v) => v.type === "Clip"),
    };
  } catch {
    return null;
  }
};

const fetchTMDBWatchProviders = async (tmdbId: number): Promise<WatchProvider[] | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/watch/providers`, {
      params: { api_key: TMDB_KEY },
    });

    const kr = res.data?.results?.KR;
    if (!kr) return null;

    const providers: WatchProvider[] = [];

    const pushList = (arr: any[], type: WatchProvider["type"]) => {
      if (!arr) return;
      arr.forEach((p) =>
        providers.push({
          providerName: p.provider_name,
          logoUrl: p.logo_path ? `${IMAGE_BASE_LOGO}${p.logo_path}` : undefined,
          type,
        })
      );
    };

    pushList(kr.flatrate, "flatrate");
    pushList(kr.rent, "rent");
    pushList(kr.buy, "buy");

    return providers.length ? providers : null;
  } catch {
    return null;
  }
};

const fetchSimilarMovies = async (tmdbId: number): Promise<string[]> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/similar`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });

    return res.data?.results?.map((m: any) => String(m.id)) ?? [];
  } catch {
    return [];
  }
};

const fetchRecommendedMovies = async (tmdbId: number): Promise<string[]> => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/recommendations`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });

    return res.data?.results?.map((m: any) => String(m.id)) ?? [];
  } catch {
    return [];
  }
};

const buildAwardsFromTmdb = (detail: any): Award[] => {
  if (!detail) return [];

  const awards: Award[] = [];
  const year = Number(detail?.release_date?.slice(0, 4)) || new Date().getFullYear();

  if (detail.vote_average >= 8 && detail.vote_count >= 5000) {
    awards.push({
      name: "TMDB Top Rated",
      category: "평점 8.0+ · 5000+ 투표",
      year,
      result: "Winner",
    });
  }

  if (detail.popularity >= 50) {
    awards.push({
      name: "TMDB Popular Title",
      category: "인기 50+",
      year,
      result: "Nominee",
    });
  }

  return awards;
};

export const enrichMovieData = async (movie: MovieDetail): Promise<MovieDetail> => {
  try {
    const tmdb = await fetchMovieFromTMDB(movie.title, movie.releaseDate);
    if (!tmdb) return movie;

    const tmdbId = tmdb.id;

    const [
      tmdbDetail,
      images,
      videos,
      providers,
      credits,
      similar,
      recommended,
    ] = await Promise.all([
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

      fetchSimilarMovies(tmdbId),      
      fetchRecommendedMovies(tmdbId),  
    ]);

    const cast: Person[] =
      credits?.cast?.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        character: c.character,
        role: "배우",
        profileUrl: c.profile_path ? `${IMAGE_BASE_POSTER}${c.profile_path}` : undefined,
      })) ?? movie.cast ?? [];

    const groupedCrew: Record<string, Person[]> = {
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
        id: String(c.id),
        name: c.name,
        role: translateJob(c.job),
        profileUrl: c.profile_path ? `${IMAGE_BASE_POSTER}${c.profile_path}` : undefined,
      });
    });

    const awards = buildAwardsFromTmdb(tmdbDetail);

    const relatedMovies = Array.from(new Set([
      ...(similar ?? []),
      ...(recommended ?? []),
    ]));

    return {
      ...movie,

      tmdbId,

      originalTitle: tmdbDetail?.original_title ?? movie.originalTitle,
      language: tmdbDetail?.original_language ?? movie.language,

      posterUrl: tmdb.poster_path ? `${IMAGE_BASE_POSTER}${tmdb.poster_path}` : movie.posterUrl,
      backdropUrl: tmdb.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${tmdb.backdrop_path}` : movie.backdropUrl,
      overview: tmdbDetail?.overview ?? movie.overview,

      rating: tmdbDetail?.vote_average ?? movie.rating,
      voteCount: tmdbDetail?.vote_count ?? movie.voteCount,
      popularity: tmdbDetail?.popularity ?? movie.popularity,
      revenue: tmdbDetail?.revenue ?? movie.revenue,

      images: images ?? movie.images,
      videos: videos ?? movie.videos,
      watchProviders: providers ?? movie.watchProviders,

      cast,
      directors: groupedCrew.directors.length ? groupedCrew.directors : movie.directors,
      writers: groupedCrew.writers.length ? groupedCrew.writers : movie.writers,
      producers: groupedCrew.producers.length ? groupedCrew.producers : movie.producers,

      awards: awards.length ? awards : movie.awards,

      relatedMovies: relatedMovies.length ? relatedMovies : movie.relatedMovies,

      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("enrichMovieData 오류:", err);
    return movie;
  }
};

export const fetchTMDBById = async (tmdbId: number) => {
  try {
    const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}`, {
      params: { api_key: TMDB_KEY, language: "ko-KR" },
    });
    return res.data;
  } catch {
    return null;
  }
};
