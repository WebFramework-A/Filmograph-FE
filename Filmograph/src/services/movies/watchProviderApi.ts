// src/services/movies/watchProviderApi.ts
// OTT 제공처 데이터 가져오기
import axios from "axios";
import type { WatchProvider } from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export const fetchWatchProviders = async (
  tmdbId: number | string
): Promise<WatchProvider[] | null> => {
  try {
    const response = await axios.get(
      `${TMDB_BASE}/movie/${tmdbId}/watch/providers`,
      {
        params: {
          api_key: TMDB_KEY,
        },
      }
    );

    const kr = response.data?.results?.KR;
    if (!kr) return null;

    const providers: WatchProvider[] = [];

    const mapProviders = (items: any[], type: "flatrate" | "rent" | "buy") => {
      if (!items) return;

      items.forEach((p) =>
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
  } catch (err) {
    console.error("Watch Provider fetch error:", err);
    return null;
  }
};
