import { useState } from "react";
import { useParams } from "react-router-dom";
import BipartiteGraph from "./BipartiteGraph";
import CollabNetworkGraph from "./CollabNetworkGraph";
import EgoGraph from "./EgoGraph";
import Searcrbar from "../common/Searcrbar";

const GraphDetail = () => {
  const { graphType } = useParams();

  // 전체 그래프 보기 리셋 플래그
  const [resetViewFlag, setResetViewFlag] = useState(false);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  const handleResetView = () => {
    setResetViewFlag((prev) => !prev);
  };

  return (
    <div className="min-h-screen max-w-full bg-[#0d5a5a] text-white overflow-x-hidden">
      <div className="mx-auto max-w-6xl pt-20 px-6 relative z-10">
        {/* 제목 + 설명 */}
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
          <h1 className="text-4xl font-bold text-yellow-200">
            {graphType === "movie" && "Movie Network"}
            {graphType === "ego" && "Ego Network"}
            {graphType === "collaboration" && "Collaboration Network"}
          </h1>

          <p className="text-sm text-white/70">
            {graphType === "movie" && "영화-영화인 네트워크 설명 써두기"}
            {graphType === "ego" && "에고 네트워크 설명 써두기"}
            {graphType === "collaboration" && "협업 네트워크 설명 써두기"}
          </p>
        </div>

        {/* 검색바 + 전체 그래프 버튼 */}
        <div className="relative w-full mt-2 flex justify-center items-center">
          <div className="w-full max-w-sm">
            <Searcrbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder={
                graphType === "movie"
                  ? "영화 제목이나 영화인을 검색해보세요."
                  : graphType === "ego"
                  ? "에고 네트워크에서 영화인을 검색해보세요."
                  : "협업 네트워크에서 영화인을 검색해보세요."
              }
            />
          </div>

          {(graphType === "movie" || graphType === "collaboration") && (
            <button
              onClick={handleResetView}
              className="absolute right-0 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-full text-sm transition-colors"
            >
              전체 그래프 보기
            </button>
          )}
        </div>
      </div>

      {/* 그래프 영역 */}
      <div className="-mt-[40px] flex justify-center">
        {graphType === "movie" && (
          <BipartiteGraph resetViewFlag={resetViewFlag} />
        )}
        {graphType === "ego" && <EgoGraph />}
        {graphType === "collaboration" && (
          <CollabNetworkGraph resetViewFlag={resetViewFlag} />
        )}
      </div>
    </div>
  );
};

export default GraphDetail;
