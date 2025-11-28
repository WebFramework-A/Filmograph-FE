// src/pages/LoadPage.tsx
import { useState, useEffect } from "react";
import { fetchMovieList, fetchMovieDetail } from "../services/movies/movieAPI";
import { saveMovie } from "../services/movieService";
import { findKobisMovieCdByTmdbId } from "../services/movies/matchTmdbToKobis";
import { countKobisCall, getKobisCalls } from "../services/kobisUsage";
import { db } from "../services/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const MAX_WRITES_PER_DAY = 10000;
const MAX_KOBIS_DAILY_CALL = 3000;

export default function LoadPage() {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("대기 중");
  const [writesToday, setWritesToday] = useState(0);
  const [kobisCalls, setKobisCalls] = useState(0);
  const [startPage, setStartPage] = useState(1);

  // 🔥 KOBIS 사용량 불러오기
  const refreshKobisInfo = async () => {
    const todayCalls = await getKobisCalls();
    setKobisCalls(todayCalls);
    setProgress(Math.min(100, Math.floor((todayCalls / MAX_KOBIS_DAILY_CALL) * 100)));
  };

  // 🔥 초기 로드
  useEffect(() => {
    const loadProgress = async () => {
      await refreshKobisInfo();

      const ref = doc(db, "system", "lastMoviePage");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const savedPage = snap.data().page;
        if (typeof savedPage === "number") setStartPage(savedPage + 1);
      }
    };

    loadProgress();
  }, []);

  // 🎯 수집 중 KOBIS 호출 제한 체크
  const checkLimit = async () => {
    const calls = await getKobisCalls();
    if (calls >= MAX_KOBIS_DAILY_CALL) {
      setStatusMsg("⚠️ KOBIS API 일일 호출 제한 도달");
      setIsRunning(false);
      return true;
    }
    return false;
  };

  // ------------------------------------
  // ⭐ 일반 영화 저장(startUpload)
  // ------------------------------------
  const startUpload = async () => {
    setIsRunning(true);
    setStatusMsg("영화 수집 중...");

    let saved = 0;
    let todayWrites = 0;
    const perPage = 100;
    let page = startPage;

    while (true) {
      // 목록 호출
      await countKobisCall();
      if (await checkLimit()) break;

      const list = await fetchMovieList(page, perPage);
      if (!list || list.length === 0) {
        setStatusMsg("더 이상 가져올 영화 데이터가 없습니다.");
        break;
      }

      // 상세 정보 수집
      for (const item of list) {
        if (todayWrites >= MAX_WRITES_PER_DAY) {
          setStatusMsg("Firestore 일일 10,000 writes 도달");
          setIsRunning(false);
          return;
        }

        const movieId = item.movieCd;

        // 상세 호출
        await countKobisCall();
        if (await checkLimit()) return;

        const detail = await fetchMovieDetail(movieId);
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

  // ------------------------------------
  // ⭐ 관련영화 확장(startExpandRelated)
  // ------------------------------------
  const startExpandRelated = async () => {
    setIsRunning(true);
    setStatusMsg("관련 영화 확장 중…");

    const snap = await getDocs(collection(db, "movies"));
    const movies = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    let saved = 0;

    for (const m of movies) {
      if (!m.relatedMovies || m.relatedMovies.length === 0) continue;

      for (const rid of m.relatedMovies) {
        const tmdbId = Number(rid);

        // TMDB → KOBIS 매칭
        await countKobisCall();
        if (await checkLimit()) return;

        const kobisId = await findKobisMovieCdByTmdbId(tmdbId);
        if (!kobisId) continue;

        // Firestore 중복 금지
        const exists = await getDoc(doc(db, "movies", kobisId));
        if (exists.exists()) continue;

        // 상세 가져오기
        await countKobisCall();
        if (await checkLimit()) return;

        const detail = await fetchMovieDetail(kobisId);
        if (!detail) continue;

        const result = await saveMovie(detail);
        if (result === "SAVED") saved++;

        await new Promise((r) => setTimeout(r, 120));
      }
    }

    setStatusMsg(`관련 영화 확장 완료: ${saved}개`);
    setIsRunning(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Firestore 영화 데이터 수집</h2>

      <p className="text-center text-gray-500">
        오늘 KOBIS 호출 수: {kobisCalls} / 3000
      </p>

      <p className="text-center text-gray-500 mb-4">
        Firestore 저장: {writesToday} / 10000
      </p>

      <p className="text-gray-600 mb-2">
        시작 페이지: <b>{startPage}</b>
      </p>

      <div className="w-full bg-gray-200 h-4 rounded overflow-hidden mb-4">
        <div
          className="h-full bg-blue-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-center mb-4">{statusMsg}</p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={startUpload}
          disabled={isRunning}
          className="px-5 py-3 bg-green-600 text-white rounded-lg shadow"
        >
          저장 시작
        </button>

        <button
          onClick={startExpandRelated}
          disabled={isRunning}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow"
        >
          관련영화 확장
        </button>
      </div>
    </div>
  );
}
