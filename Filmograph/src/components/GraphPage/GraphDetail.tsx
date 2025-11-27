// src/components/GraphPage/GraphDetail.tsx
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BipartiteGraph from "./BipartiteGraph";
import CollabNetworkGraph from "./CollabNetworkGraph";
import EgoGraph from "./EgoGraph";
import Searcrbar from "../common/Searcrbar";
import { Toast } from "../common/Toast";

const GraphDetail = () => {
  const { graphType } = useParams();

  const [resetViewFlag, setResetViewFlag] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNoResultToast, setShowNoResultToast] = useState(false);

  // 전체 그래프 초기화
  const handleResetView = () => {
    setResetViewFlag((prev) => !prev);
    setSearchTerm("");
    setInputValue("");
    setShowNoResultToast(false);
  };

  // 검색 실행
  const handleSearch = () => {
    setSearchTerm(""); 
    setTimeout(() => setSearchTerm(inputValue), 10);
  };

  // 검색 실패 시 토스트 띄우기 
  const handleNoResult = useCallback(() => {
    setShowNoResultToast(true);

    setTimeout(() => {
      setShowNoResultToast(false);
    }, 1500);
  }, []);

  return (
    <>
      {/* 토스트 */}
      <Toast
        message="검색 결과가 없습니다."
        show={showNoResultToast}
        onClose={() => setShowNoResultToast(false)}
      />

      <div className="min-h-screen max-w-full bg-[#0b4747] text-white overflow-x-hidden">
        <div className="mx-auto max-w-6xl pt-20 px-6 relative z-10">
          {/* 제목 */}
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
            <h1 className="text-4xl font-bold text-yellow-200">
              {graphType === "movie" && "Movie Network"}
              {graphType === "ego" && "Ego Network"}
              {graphType === "collaboration" && "Collaboration Network"}
            </h1>

            <p className="text-sm text-white/70">
              {graphType === "movie" && "영화-영화인 네트워크 설명 써두기"}
              {graphType === "ego" && "에고 네트워크 설명 써두기"}
              {graphType === "collaboration" && "노드를 탐색하여 영화인들의 협업 관계와 커뮤니티 구조를 확인해보세요."}
            </p>
          </div>

          {/* 검색바 + 전체보기 버튼 */}
          <div className="relative w-full mt-2 flex justify-center items-center">
            <div className="w-full max-w-sm">
              <Searcrbar
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSearch={handleSearch}
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
                className="cursor-pointer absolute right-0 
                  bg-white/10 hover:bg-white/20 
                  text-white border border-white/30 
                  px-4 py-2 rounded-full text-sm transition-colors"
              >
                전체 그래프 보기
              </button>
            )}
          </div>
        </div>

        {/* 그래프 영역 */}
        <div className="mx-auto max-w-6xl pt-3 px-6">
          {graphType === "movie" && (
            <BipartiteGraph
              resetViewFlag={resetViewFlag}
              searchTerm={searchTerm}
              onNoResult={handleNoResult}
            />
          )}

          {graphType === "ego" && <EgoGraph />}

          {graphType === "collaboration" && (
            <CollabNetworkGraph
              resetViewFlag={resetViewFlag}
              searchTerm={searchTerm}
              onNoResult={handleNoResult}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GraphDetail;
