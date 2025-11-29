import { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { COUNTRY_NAMES_KR } from "../../data/countryNamesKR";

type HoverMovie = {
  country: string;
  title: string;
  poster: string | null;
  rating: number | string;
} | null;


export default function WorldMap() {
  const mapRef = useRef<any>(null);

  const [hoverMovie, setHoverMovie] = useState<HoverMovie>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // TMDB 영화 가져오기
  const fetchMovie = async (isoCode: string) => {
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    };

    // ISO 코드 기반 origin_country 검색
    let url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&with_origin_country=${isoCode}&language=ko-KR`;
    let res = await fetch(url, { headers });
    let json = await res.json();

    if (json.results?.length > 0) return json.results[0];

    // fallback
    url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&region=${isoCode}&language=ko-KR`;
    res = await fetch(url, { headers });
    json = await res.json();

    if (json.results?.length > 0) return json.results[0];

    return null;
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
    polygonTemplate.stroke = am4core.color("#BFD7EA");

    polygonTemplate.states.create("hover").properties.fill =
      am4core.color("#a3c5ff");

    // 마우스 호버 시
    polygonTemplate.events.on("over", async (ev) => {
      const d = ev.target.dataItem?.dataContext as {
        id: string;   // ISO 코드
        name: string; // 영어 국가명
      };
      if (!d) return;

    const event = ev.event as MouseEvent | TouchEvent;

    let px = 0;
    let py = 0;

    if (event instanceof MouseEvent) {
        px = event.pageX;
        py = event.pageY;
        } else if ("touches" in event && event.touches.length > 0) {
        px = event.touches[0].pageX;
        py = event.touches[0].pageY;
        }

    setHoverPos({ x: px + 10, y: py + 10 });


    // 영어 -> 한국어 변환
    const koreanName = COUNTRY_NAMES_KR[d.name] || d.name;

    const movie = await fetchMovie(d.id);

      if (!movie) {
        setHoverMovie({
          country: koreanName,
          title: "데이터가 없어요.",
          poster: null,
          rating: "-",
        });
        return;
      }

      setHoverMovie({
        country: koreanName,
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : null,
        rating: movie.vote_average,
      });
    });

    polygonTemplate.events.on("out", () => setHoverMovie(null));

    mapRef.current = map;
    return () => map.dispose();
    }, []);

   return (
    <>
      <div
        id="world-map"
        className="w-full h-[75vh] sm:h-[70vh] md:h-[75vh] lg:h-[70vh]"
      />

      {hoverMovie && (
        <div
          className="fixed bg-black/80 text-white p-3 rounded-xl shadow-xl z-50 w-56"
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
              className="w-full rounded-md mb-2"
            />
          )}

          <p className="text-sm text-yellow-300">
            ⭐ 평점: {hoverMovie.rating}
          </p>
        </div>
      )}
    </>
  );
}
