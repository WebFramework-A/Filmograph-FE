// src/pages/DetailPage.tsx
import { useState } from "react";
import { fetchMovieList, fetchMovieDetail } from "../services/movies/movieAPI";
import { saveMovie } from "../services/movieService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const MAX_WRITES_PER_DAY = 10000;

export default function DetailPage() {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("대기 중");
  const [writtenToday, setWrittenToday] = useState(0);

  const startUpload = async () => {
    setIsRunning(true);
    setProgress(0);
    setStatusMsg("영화 수집 중...");

    const totalPages = 100;
    const perPage = 100;
    const totalItems = totalPages * perPage;

    let processed = 0;
    let savedCount = 0;
    let todayWrites = writtenToday;

    for (let page = 4; page <= totalPages; page++) {
      const list = await fetchMovieList(page, perPage);

      for (const item of list) {
        processed++;

        // **10,000 writes/day 방지**
        if (todayWrites >= MAX_WRITES_PER_DAY) {
          setStatusMsg("❌❌❌ Firestore 10,000 writes/day 도달. ❌❌❌");
          setIsRunning(false);
          return;
        }

        try {
          const movieId = item.movieCd;

          // 이미 Firestore에 존재하면 저장 안 함
          const docRef = doc(db, "movies", movieId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            continue;
          }

          // KOBIS 상세
          const detail = await fetchMovieDetail(movieId);
          if (!detail) continue;

          // **saveMovie 내부에 필터링을 모두 맡긴다**
          const result = await saveMovie(detail);

          if (result === "SAVED") {
            todayWrites++;
            savedCount++;
          }

          // API 과부하 방지
          await new Promise((r) => setTimeout(r, 150));

        } catch (err) {
          console.warn(`⚠ 처리 실패: ${item.movieNm}`, err);
        }

        // 진행률 업데이트
        setProgress(Math.round((processed / totalItems) * 100));
      }
    }

    setWrittenToday(todayWrites);
    setIsRunning(false);
    setStatusMsg(`완료! 저장 성공: ${savedCount}개`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Firestore 영화 데이터 수집
      </h2>

      {/* 진행률 바 */}
      <div className="w-full h-6 bg-gray-200 rounded-full my-4 overflow-hidden">
        <div
          className="h-full bg-[#34C3F1] transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-center text-gray-700 mb-4">{statusMsg}</p>

      <p className="text-center text-gray-500 mb-6">
        오늘 저장된 영화: {writtenToday} / {MAX_WRITES_PER_DAY}
      </p>

      {/* 버튼: 오직 1개 */}
      <div className="flex justify-center">
        <button
          onClick={startUpload}
          disabled={isRunning}
          className="px-8 py-4 bg-[#00B26B] hover:bg-[#00995e] text-white 
                     rounded-xl font-bold shadow-md disabled:opacity-50 active:scale-95 transition"
        >
          19금 + TMDB 없는 영화 제외 후 저장
        </button>
      </div>
    </div>
  );
}