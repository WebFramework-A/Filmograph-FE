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
            console.log(`🚫 제외 (19세 관람불가): ${detail.title}`);
            continue;
          }

          // Firestore 저장
          const result = await saveMovie(detail);

          // TMDB 정보 없는 영화 제외
          if (mode === "skipTmdb" && result === "SKIPPED_TMDB") {
            console.log(`⏭️ TMDB 정보 없음: ${detail.title}`);
            continue;
          }

          totalSaved++;
          //console.log(`저장 완료: ${detail.title}`);
          await new Promise((r) => setTimeout(r, 200)); // API 부하 방지
        } catch (err) {
          console.warn(`⚠️ ${item.movieNm} 처리 실패`, err);
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
    <div style={{ padding: "2rem" }}>
      <h2>🎬 Firestore 영화 데이터 수집</h2>
      <div
        style={{
          width: "100%",
          height: "20px",
          backgroundColor: "#eee",
          borderRadius: "10px",
          margin: "1rem 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#34C3F1",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <p>{statusMsg}</p>

      <div>
        <button
          onClick={() => handleUpload("skipTmdb")}
          style={buttonStyle("#00B26B")}
          disabled={isRunning}
        >
          🎞 TMDB 없는 영화 제외
        </button>
        <button
          onClick={() => handleUpload("all")}
          style={buttonStyle("#34C3F1")}
          disabled={isRunning}
        >
          모두 저장
        </button>
        <button
          onClick={() => handleUpload("no19")}
          style={buttonStyle("#FF5252")}
          disabled={isRunning}
        >
          🚫 19세 영화 제외
        </button>
      </div>
    </div>
  );
};

const buttonStyle = (color: string) => ({
  margin: "0.5rem",
  padding: "0.6rem 1rem",
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
});

export default DetailPage;