import { useState } from "react";
import { fetchMovieList, fetchMovieDetail } from "../services/movies/movieAPI";
import { saveMovie } from "../services/movieService";
import { db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const DetailPage = () => {
  // 진행률과 상태 메시지 관리
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("대기 중");

  // 영화 저장 로직
  //  @param mode 저장 모드 ("all" | "skipTmdb" | "no19")
  const handleUpload = async (mode: "all" | "skipTmdb" | "no19") => {
    setProgress(0);
    setIsRunning(true);
    setStatusMsg("영화 수집 중...");

    const totalPages = 5; // 수집할 페이지 수 (100 * 2 = 200개)
    const perPage = 100;
    const totalItems = totalPages * perPage;

    let processed = 0;
    let totalSaved = 0;

    for (let page = 1; page <= totalPages; page++) {
      const list = await fetchMovieList(page, perPage);

      for (const item of list) {
        processed++;
        try {
          // 이미 Firestore에 있는 영화는 스킵
          const docRef = doc(db, "movies", item.movieCd);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) continue;

          // 영화 상세정보(KOBIS) 가져오기
          const detail = await fetchMovieDetail(item.movieCd);
          if (!detail) continue;

          // 19세 관람불가 영화 제외
          if (mode === "no19" && detail.watchGrade?.includes("청소년")) {
            console.log(`제외 (19세 관람불가): ${detail.title}`);
            continue;
          }

          // Firestore 저장
          const result = await saveMovie(detail);

          // TMDB 정보 없는 영화 제외
          if (mode === "skipTmdb" && result === "SKIPPED_TMDB") {
            console.log(`TMDB 정보 없음: ${detail.title}`);
            continue;
          }

          totalSaved++;
          //console.log(`저장 완료: ${detail.title}`);
          await new Promise((r) => setTimeout(r, 200)); // API 부하 방지
        } catch (err) {
          console.warn(`${item.movieNm} 처리 실패`, err);
        }

        // 진행률 업데이트
        setProgress(Math.round((processed / totalItems) * 100));
      }
    }

    // 완료 후 상태 표시
    setStatusMsg(`완료! ${totalSaved}개 저장됨`);
    setIsRunning(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto"> {/* 전체 컨테이너에 패딩과 최대 너비 적용 */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Firestore 영화 데이터 수집
      </h2>

      {/* 진행률 바 컨테이너 */}
      <div className="w-full h-6 bg-gray-200 rounded-full my-4 overflow-hidden shadow-inner">
        {/* 진행률 바 (너비는 동적이므로 인라인 스타일 유지) */}
        <div
          className="h-full bg-[#34C3F1] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 상태 메시지 */}
      <p className="text-gray-600 mb-6 font-medium text-center">
        {statusMsg}
      </p>

      {/* 버튼 그룹 */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => handleUpload("skipTmdb")}
          disabled={isRunning}
          className="px-6 py-3 bg-[#00B26B] text-white rounded-lg font-bold shadow-md
                     hover:bg-[#009e5f] hover:shadow-lg active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          TMDB 없는 영화 제외
        </button>
        <button
          onClick={() => handleUpload("all")}
          disabled={isRunning}
          className="px-6 py-3 bg-[#34C3F1] text-white rounded-lg font-bold shadow-md
                     hover:bg-[#2dbae6] hover:shadow-lg active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          모두 저장
        </button>
        <button
          onClick={() => handleUpload("no19")}
          disabled={isRunning}
          className="px-6 py-3 bg-[#FF5252] text-white rounded-lg font-bold shadow-md
                     hover:bg-[#e64a4a] hover:shadow-lg active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          19세 영화 제외
        </button>
      </div>
    </div>
  );
};

export default DetailPage;