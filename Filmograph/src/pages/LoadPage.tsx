import { useState, useEffect } from "react";
import {
  fetchMovieList,
  fetchMovieDetail,
} from "../services/movies/movieAPI";

import { saveMovie } from "../services/movieService";
import {
  countKobisCall,
  getKobisCalls,
} from "../services/kobisUsage";

import { findKobisMovieCdByTmdbId } from "../services/movies/matchTmdbToKobis";

import { db } from "../services/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY;

const MAX_WRITES_PER_DAY = 10000;
const MAX_KOBIS_DAILY_CALL = 3000;

export default function LoadPage() {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("대기 중");
  const [writesToday, setWritesToday] = useState(0);
  const [kobisCalls, setKobisCalls] = useState(0);
  const [startPage, setStartPage] = useState(1);

  const refreshKobisInfo = async () => {
    const todayCalls = await getKobisCalls();
    setKobisCalls(todayCalls);
    setProgress(
      Math.min(100, Math.floor((todayCalls / MAX_KOBIS_DAILY_CALL) * 100))
    );
  };

  useEffect(() => {
    const load = async () => {
      await refreshKobisInfo();
      const ref = doc(db, "system", "lastMoviePage");
      const snap = await getDoc(ref);
      if (snap.exists() && typeof snap.data().page === "number") {
        setStartPage(snap.data().page + 1);
      }
    };
    load();
  }, []);

  const checkLimit = async () => {
    const calls = await getKobisCalls();
    if (calls >= MAX_KOBIS_DAILY_CALL) {
      setStatusMsg("KOBIS API 일일 호출 제한 도달");
      setIsRunning(false);
      return true;
    }
    return false;
  };

  const startUpload = async () => {
    setIsRunning(true);
    setStatusMsg("영화 수집 중…");

    let saved = 0;
    let todayWrites = 0;
    const perPage = 100;
    let page = startPage;

    while (true) {
      await countKobisCall();
      if (await checkLimit()) break;

      const list = await fetchMovieList(page, perPage);
      if (!list || !list.length) {
        setStatusMsg("더 이상 영화 없음");
        break;
      }

      for (const item of list) {
        if (todayWrites >= MAX_WRITES_PER_DAY) {
          setStatusMsg("일일 Firestore 10,000 writes 도달");
          setIsRunning(false);
          return;
        }

        await countKobisCall();
        if (await checkLimit()) return;

        const detail = await fetchMovieDetail(item.movieCd);
        if (!detail) continue;

        const result = await saveMovie(detail);

        if (result === "SAVED") {
          todayWrites++;
          saved++;
          setWritesToday(todayWrites);
        }

        await new Promise((r) => setTimeout(r, 120));
      }

      await setDoc(doc(db, "system", "lastMoviePage"), {
        page,
        updatedAt: new Date().toISOString(),
      });

      page++;
    }

    setStatusMsg(`완료! 저장 성공: ${saved}개`);
    setIsRunning(false);
  };

  const startBoxOffice = async () => {
    setIsRunning(true);
    setStatusMsg("박스오피스 수집 중...");

    let saved = 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ymd = yesterday.toISOString().slice(0, 10).replace(/-/g, "");

    // KOBIS: 박스오피스 TOP10
    await countKobisCall();
    if (await checkLimit()) return;

    const BO_URL = `https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json`;
    const res = await fetch(`${BO_URL}?key=${KOBIS_KEY}&targetDt=${ymd}`);
    const data = await res.json();

    const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
    const top10 = list.slice(0, 10);

    for (const item of top10) {
      const movieCd = item.movieCd;

      await countKobisCall();
      if (await checkLimit()) break;

      const detail = await fetchMovieDetail(movieCd);
      if (!detail) continue;

      await saveMovie(detail);

      await setDoc(doc(db, "boxOffice", movieCd), {
        rank: Number(item.rank),
        rankInten: Number(item.rankInten),
        movieCd,
        movieNm: item.movieNm,
        openDt: detail.openDt || item.openDt || null,
        salesAcc: Number(item.salesAcc || 0),
        poster: detail.poster || null,
        updatedAt: new Date().toISOString(),
      });

      saved++;
      await new Promise((r) => setTimeout(r, 120));
    }

    setStatusMsg(`박스오피스 저장 완료: ${saved}개`);
    setIsRunning(false);
  };


  const startExpandRelated = async () => {
    setIsRunning(true);
    setStatusMsg("관련 영화 확장 중…");

    const snap = await getDocs(collection(db, "movies"));
    const movies = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];

    let saved = 0;

    for (const m of movies) {
      if (!m.relatedMovies?.length) continue;

      for (const rid of m.relatedMovies) {
        const tmdbId = Number(rid);

        await countKobisCall();
        if (await checkLimit()) return;

        const kobisId = await findKobisMovieCdByTmdbId(tmdbId);
        if (!kobisId) continue;

        const exists = await getDoc(doc(db, "movies", kobisId));
        if (exists.exists()) continue;

        await countKobisCall();
        if (await checkLimit()) return;

        const detail = await fetchMovieDetail(kobisId);
        if (!detail) continue;

        const result = await saveMovie(detail);
        if (result === "SAVED") saved++;

        await new Promise((r) => setTimeout(r, 150));
      }
    }

    setStatusMsg(`관련 영화 확장 완료: ${saved}개`);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen pt-30 pb-10 bg-[#004f51] text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-200">🎬 영화 데이터 수집기</h1>
          <p className="text-white/80 mt-2">
            KOBIS + TMDB 기반 영화 데이터를 Firestore에 저장합니다
          </p>
        </div>

        {/* Status */}
        <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-6">
          <p className="text-center text-lg">
            오늘 KOBIS 호출:{" "}
            <span className="text-yellow-200">{kobisCalls}</span> / 3000
          </p>
          <p className="text-center">
            Firestore writes:{" "}
            <span className="text-yellow-200">{writesToday}</span> / 10000
          </p>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/10 rounded mt-4 overflow-hidden">
            <div
              className="h-full bg-yellow-200 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-center mt-3">{statusMsg}</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* 전체 저장 */}
          <button
            onClick={startUpload}
            disabled={isRunning}
            className="p-6 rounded-xl bg-yellow-200 text-black font-bold hover:bg-yellow-300 disabled:opacity-50"
          >
            전체 영화 저장
          </button>

          {/* 박스오피스 */}
          <button
            onClick={startBoxOffice}
            disabled={isRunning}
            className="p-6 rounded-xl bg-yellow-200 text-black font-bold hover:bg-yellow-300 disabled:opacity-50"
          >
            박스오피스 TOP10
          </button>

          {/* 관련 확장 */}
          <button
            onClick={startExpandRelated}
            disabled={isRunning}
            className="p-6 rounded-xl bg-yellow-200 text-black font-bold hover:bg-yellow-300 disabled:opacity-50"
          >
            관련 영화 확장
          </button>
        </div>
      </div>
    </div>
  );
}
