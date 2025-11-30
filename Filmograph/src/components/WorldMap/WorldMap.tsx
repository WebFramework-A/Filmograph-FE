import { useEffect, useRef, useState, useCallback } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { COUNTRY_NAMES_KR } from "../../data/countryNamesKR";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../../components/common/Toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/data/firebaseConfig";

type HoverMovieCore = {
  country: string;
  title: string;
  poster: string | null;
  releaseDate?: string;
  genres?: string;
  runtime?: number;
  id: number; // TMDB id
};

type HoverMovie = HoverMovieCore | null;

type CountryData = {
  id: string;
  name: string;
};

// TMDB 제목을 Firestore KOBIS ID와 매칭
async function findKobisIdByTitle(title: string) {
  const q = query(
    collection(db, "movies"),
    where("title", "==", title)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return snap.docs[0].id; // 문서 ID = KOBIS movieCode
}

export default function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hoverMovie, setHoverMovie] = useState<HoverMovie>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  // TMDB 상세 정보
  const fetchMovieDetail = useCallback(async (id: number) => {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=ko-KR`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
        },
      }
    );
    return res.json();
  }, []);

  // 현재 상영작 중 인기 1위 가져오기
  const fetchMovie = useCallback(
    async (isoCode: string) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?region=${isoCode}&language=ko-KR`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
          },
        }
      );
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
        id: movie.id, // TMDB id
      } as HoverMovieCore;
    },
    [fetchMovieDetail]
  );

  const formatKoreanDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  };

  // ===== 지도 렌더링 =====
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

    let hideTimeout: number | undefined;

    polygonTemplate.events.on("over", async (ev) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = undefined;
      }

      const d = ev.target.dataItem?.dataContext as CountryData;
      if (!d) return;

      const event = ev.event as MouseEvent;
      const container = mapContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // 박스 위치 계산
      const px = event.clientX;
      const py = event.clientY;

      const boxWidth = 200;
      const boxHeight = 260;

      let left = px - rect.left + 10;
      let top = py - rect.top - boxHeight - 15;

      if (left + boxWidth > rect.width) {
        left = px - rect.left - boxWidth - 15;
      }

      if (top < 0) {
        top = py - rect.top + 10;
      }

      left = Math.max(left, 10);
      top = Math.min(top, rect.height - boxHeight - 20);

      setHoverPos({ x: left, y: top });

      const koreanName = COUNTRY_NAMES_KR[d.name] || d.name;
      const movie = await fetchMovie(d.id);

      // 데이터 없을 때
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
          id: -1,
        });
        return;
      }

      // 데이터 있을 때
      setHoverMovie({
        country: koreanName,
        title: movie.title,
        poster: movie.poster,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        runtime: movie.runtime,
        id: movie.id, // TMDB id 저장
      });
    });

    // hover out 0.7초 후 사라지게
    polygonTemplate.events.on("out", () => {
      hideTimeout = window.setTimeout(() => {
        setHoverMovie(null);
      }, 700);
    });

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      if (map && !map.isDisposed()) map.dispose();
    };
  }, [fetchMovie]);

  // 포스터 클릭(TMDB id -> kobis id 찾아서 상세페에지 이동)
  const goToDetail = async () => {
    if (!hoverMovie) return;
    const kobisId = await findKobisIdByTitle(hoverMovie.title);

    if (kobisId) {
      navigate(`/detail/${kobisId}`);
    } else {
      showToast("상세 정보가 아직 준비되지 않았습니다.");

    }
  };

  return (
    
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
            pointerEvents: "auto",
          }}
        >
          <p className="text-yellow-300 font-bold text-[14px] mb-1">
            {hoverMovie.country}
          </p>

          <p className="font-semibold mb-2 text-[13px]">
            {hoverMovie.title}
          </p>

          {/* 클릭 시 상세페이지 이동 */}
          {hoverMovie.poster && hoverMovie.id !== -1 && (
            <img
              src={hoverMovie.poster}
              className="w-[170px] h-[190px] rounded-none mb-2 mx-auto cursor-pointer"
              onClick={goToDetail}
            />
          )}

          {hoverMovie.releaseDate && (
            <p className="text-[11px] text-gray-300 mt-1">
              {formatKoreanDate(hoverMovie.releaseDate)}
            </p>
          )}

          {(hoverMovie.genres || hoverMovie.runtime) && (
            <p className="text-[11px] text-gray-300">
              {hoverMovie.genres} · {hoverMovie.runtime}분
            </p>
          )}
        </div>
      )}

      <Toast
  message={toast.message}
  show={toast.show}
  onClose={() => {}}
  actionLabel={toast.actionLabel}
  actionUrl={toast.actionUrl}
/>
    </div>
    
  );
}
