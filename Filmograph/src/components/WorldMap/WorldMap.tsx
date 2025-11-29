import { useEffect, useRef, useState, useCallback } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { COUNTRY_NAMES_KR } from "../../data/countryNamesKR";

type HoverMovie = {
  country: string;
  title: string;
  poster: string | null;
  releaseDate?: string;
  genres?: string;
  runtime?: number;
} | null;

type CountryData = {
  id: string;
  name: string;
};

export default function WorldMap() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [hoverMovie, setHoverMovie] = useState<HoverMovie>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // TMDB 상세 정보
  const fetchMovieDetail = useCallback(async (id: number) => {
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    };
    const url = `https://api.themoviedb.org/3/movie/${id}?language=ko-KR`;
    const res = await fetch(url, { headers });
    return await res.json();
  }, []);

  // 현재 상영작 중 인기 1위 가져오기
  const fetchMovie = useCallback(
    async (isoCode: string) => {
      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
      };

      const url = `https://api.themoviedb.org/3/movie/now_playing?region=${isoCode}&language=ko-KR`;
      const res = await fetch(url, { headers });
      const json = await res.json();

      const movies = json.results;
      if (!movies || movies.length === 0) return null;

      movies.sort((a: any, b: any) => b.popularity - a.popularity);
      const movie = movies[0];

      const detail = await fetchMovieDetail(movie.id);

      return {
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : null,
        releaseDate: detail.release_date,
        genres: detail.genres?.map((g: any) => g.name).slice(0, 2).join(", "),
        runtime: detail.runtime,
      };
    },
    [fetchMovieDetail]
  );

  const formatKoreanDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  };

  // 지도 렌더링
  useEffect(() => {
    const map = am4core.create("world-map", am4maps.MapChart);
    map.geodata = am4geodata_worldLow;
    map.projection = new am4maps.projections.NaturalEarth1();

    const polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;

    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.fill = am4core.color("#637280");
    polygonTemplate.stroke = am4core.color("#FFFFFFB3");
    polygonTemplate.strokeWidth = 0.8;

    const hoverState = polygonTemplate.states.create("hover");
    hoverState.properties.fill = am4core.color("#FDE047");

    // hover 이벤트
    polygonTemplate.events.on("over", async (ev) => {
      const d = ev.target.dataItem?.dataContext as CountryData;
      if (!d) return;

      const event = ev.event as MouseEvent;
      const px = event.clientX;
      const py = event.clientY;

      const container = mapContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const boxWidth = 200;
      const boxHeight = 260; // 기본 박스 높이(데이터 있을 때)

      // 1. 기본 위치 계산
      let left = px - rect.left + 13;
      let top = py - rect.top - boxHeight - 15;

      if (left + boxWidth > rect.width) {
        left = px - rect.left - boxWidth - 15;
      }

      if (top < 0) {
        top = py - rect.top + 10;
      }

      left = Math.max(left, 10);
      top = Math.min(top, rect.height - boxHeight - 33);

      // 기본 위치 미리 설정
      setHoverPos({ x: left, y: top });

      const koreanName = COUNTRY_NAMES_KR[d.name] || d.name;
      const movie = await fetchMovie(d.id);

      // 2. 데이터 없을 때
      if (!movie) {
        const adjustedTop = py - rect.top + 10;

        setHoverPos({
          x: left,
          y: Math.min(adjustedTop, rect.height - 80),
        });

        setHoverMovie({
          country: koreanName,
          title: "데이터가 없어요.",
          poster: null,
        });

        return;
      }

      // 3. 데이터 있을 때
      setHoverMovie({
        country: koreanName,
        title: movie.title,
        poster: movie.poster,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        runtime: movie.runtime,
      });
    });

    polygonTemplate.events.on("out", () => setHoverMovie(null));

    mapRef.current = map;
    return () => map.dispose();
  }, [fetchMovie]);

  return (
    <>
      <div
        id="world-map"
        ref={mapContainerRef}
        className="relative w-full h-[75vh] sm:h-[70vh] md:h-[75vh] lg:h-[70vh]"
      >
        {hoverMovie && (
          <div
            className="absolute bg-black/80 text-white p-3 rounded-xl shadow-xl z-50 w-48"
            style={{
              left: hoverPos.x,
              top: hoverPos.y,
              pointerEvents: "none",
            }}
          >
            <p className="text-yellow-300 font-bold text-[14px] mb-1">
              {hoverMovie.country}
            </p>

            <p className="font-semibold mb-2 text-[13px]">
              {hoverMovie.title}
            </p>

            {hoverMovie.poster && (
              <img
                src={hoverMovie.poster}
                className="w-[170px] h-[190px] rounded-none mb-2 mx-auto"
              />
            )}
            {/* 개봉일 */}
            {hoverMovie.releaseDate && (
              <p className="text-[11px] text-gray-300 mt-1">
                {formatKoreanDate(hoverMovie.releaseDate)}
              </p>
            )}
            {/* 장르, 러닝타임 */}
            {(hoverMovie.genres || hoverMovie.runtime) && (
              <p className="text-[11px] text-gray-300">
                {hoverMovie.genres} · {hoverMovie.runtime}분
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
