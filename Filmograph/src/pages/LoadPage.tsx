// src/pages/LoadPage.tsx
import { useState, useEffect } from "react";
import { fetchMovieList, fetchMovieDetail } from "../services/movies/movieAPI";
import { saveMovie } from "../services/movieService";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const MAX_WRITES_PER_DAY = 10000;       
const MAX_KOBIS_DAILY_CALL = 3000;      // KOBIS 일일 호출 제한

export default function DetailPage() {
  const [progress, setProgress] = useState(0);          // KOBIS 호출 기준 진행률 (%)
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("대기 중");
  const [writesToday, setWritesToday] = useState(0);    
  const [kobisCalls, setKobisCalls] = useState(0);      // 오늘 KOBIS 호출 수
  const [startPage, setStartPage] = useState(0);      
  const totalPages = 100;    

  /** Firestore에서 마지막 저장 페이지 + KOBIS 사용량 불러오기 */
  useEffect(() => {
    const loadProgress = async () => {
      const ref = doc(db, "system", "lastMoviePage");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const savedPage = snap.data().page;
        if (typeof savedPage === "number") {
          setStartPage(savedPage + 1);
        }
      }

      const usageRef = doc(db, "system", "kobisUsage");
      const usageSnap = await getDoc(usageRef);

      const today = new Date().toISOString().slice(0, 10);

      if (usageSnap.exists() && usageSnap.data().date === today) {
        const calls = usageSnap.data().calls ?? 0;
        setKobisCalls(calls);
        setProgress(Math.min(100, Math.floor((calls / MAX_KOBIS_DAILY_CALL) * 100)));
      } else {
        await setDoc(usageRef, { date: today, calls: 0 });
        setKobisCalls(0);
        setProgress(0);
      }
    };

    loadProgress();
  }, []);

  const incrementKobisUsage = async () => {
    const usageRef = doc(db, "system", "kobisUsage");
    const snap = await getDoc(usageRef);

    const today = new Date().toISOString().slice(0, 10);

    let current = 0;

    if (!snap.exists() || snap.data().date !== today) {
      current = 1;
      await setDoc(usageRef, { date: today, calls: current });
    } else {
      current = (snap.data().calls ?? 0) + 1;
      await setDoc(usageRef, { date: today, calls: current }, { merge: true });
    }

    setKobisCalls(current);
    setProgress(Math.min(100, Math.floor((current / MAX_KOBIS_DAILY_CALL) * 100)));

    return current;
  };

  /** 마지막 저장 페이지 Firestore에 기록 */
  const updateLastPage = async (page: number) => {
    await setDoc(doc(db, "system", "lastMoviePage"), {
      page,
      updatedAt: new Date().toISOString(),
    });
  };

  const startUpload = async () => {
    setIsRunning(true);
    setStatusMsg("영화 수집 중...");

    let saved = 0;
    let todayWrites = 0;
    const perPage = 100;

    for (let page = startPage; page <= startPage + totalPages; page++) {
      
      // KOBIS 영화 목록 API 호출
      const list = await fetchMovieList(page, perPage);

      const listCalls = await incrementKobisUsage();
      if (listCalls >= MAX_KOBIS_DAILY_CALL) {
        setStatusMsg("KOBIS API 일일 3,000 요청 초과");
        setIsRunning(false);
        return;
      }

      for (const item of list) {
        if (todayWrites >= MAX_WRITES_PER_DAY) {
          setStatusMsg("Firestore 10,000 writes/day 도달");
          setIsRunning(false);
          return;
        }

        try {
          const movieId = item.movieCd;

          const movieRef = doc(db, "movies", movieId);
          const movieSnap = await getDoc(movieRef);
          if (movieSnap.exists()) {
            continue;
          }

          const detail = await fetchMovieDetail(movieId);

          const detailCalls = await incrementKobisUsage();
          if (detailCalls >= MAX_KOBIS_DAILY_CALL) {
            setStatusMsg("KOBIS API 일일 3,000 요청 초과");
            setIsRunning(false);
            return;
          }

          if (!detail) continue;

          // Firestore 저장
          const result = await saveMovie(detail);

          if (result === "SAVED") {
            todayWrites++;
            saved++;
            setWritesToday(todayWrites);
          }

          // API 부하 방지
          await new Promise((r) => setTimeout(r, 150));
        } catch (err) {
          console.warn(" 처리 실패:", err);
        }
      }

      // 페이지 단위 진행 저장
      await updateLastPage(page);
    }

    setStatusMsg(`완료! 저장 성공: ${saved}개`);
    setIsRunning(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Firestore 영화 데이터 수집</h2>

      <p className="text-center text-gray-500">
        오늘 KOBIS 호출 수: {kobisCalls} / {MAX_KOBIS_DAILY_CALL}
      </p>
      <p className="text-center text-gray-500 mb-4">
        오늘 Firestore 저장 횟수: {writesToday} / {MAX_WRITES_PER_DAY}
      </p>

      <p className="text-gray-600 mb-2">
        현재 이어서 시작될 페이지: <b>{startPage}</b>
      </p>

      {/* 진행률 바: KOBIS 사용량 기준 */}
      <div className="w-full bg-gray-200 h-4 rounded overflow-hidden mb-4">
        <div
          className="h-full bg-blue-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-center mb-4">{statusMsg}</p>

      <div className="flex justify-center">
        <button
          onClick={startUpload}
          disabled={isRunning}
          className="px-5 py-3 bg-green-600 text-white rounded-lg shadow disabled:opacity-50 active:scale-95 transition"
        >
          저장 시작 (자동 이어받기)
        </button>
      </div>
    </div>
  );
}
