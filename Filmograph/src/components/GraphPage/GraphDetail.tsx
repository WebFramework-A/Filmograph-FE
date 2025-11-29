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

  // 검색 관련 상태
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNoResultToast, setShowNoResultToast] = useState(false);

  // 전체 그래프 초기화 핸들러
  const handleResetView = () => {
    setResetViewFlag((prev) => !prev);
    setSearchTerm("");
    setInputValue("");
    setShowNoResultToast(false);
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    setSearchTerm("");
    setTimeout(() => setSearchTerm(inputValue), 10);
  };

  // 검색 결과 없음 토스트 핸들러
  const handleNoResult = useCallback(() => {
    setShowNoResultToast(true);
    setTimeout(() => {
      setShowNoResultToast(false);
    }, 1500);
  }, []);

  return (
    <div className="bg-[#0b4747] min-h-screen">
      {/* 토스트 */}
      <Toast
        message="검색 결과가 없습니다."
        show={showNoResultToast}
        onClose={() => setShowNoResultToast(false)}
      />

      <div className="h-screen w-full pt-20 text-white flex flex-col overflow-hidden relative">

        {/* 헤더 */}
        <div className="shrink-0 px-8 pb-4 z-10">
          <div className="max-w-6xl mx-auto">
            <header className="mb-2 md:mb-3">
              <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
                <h1 className="text-4xl font-bold text-yellow-200">
                  {graphType === "movie" && "Movie Network"}
                  {graphType === "ego" && "Ego Network"}
                  {graphType === "collaboration" && "Collaboration Network"}
                </h1>
                <p className="text-sm text-white/70 whitespace-nowrap text-right pl-4">
                  {graphType === "movie" &&
                    "여러 영화와 영화인들 사이의 유기적인 관계를 한눈에 파악해보세요."}
                  {graphType === "ego" &&
                    "한 인물을 중심으로 구성된 에고 네트워크를 시각적으로 탐험해보세요."}
                  {graphType === "collaboration" &&
                    "노드를 탐색하며, 같은 색으로 구분되는 커뮤니티 그룹과 영화인들의 협업 관계를 확인해보세요."}
                </p>
              </div>
            </header>

            {/* 검색 영역 */}
            <div className="relative w-full mt-2 flex justify-center items-center">
              {/* 범례 (movie 그래프일 때만) */}
              {graphType === "movie" && (
                <div
                  className="
                    absolute left-0 top-1/2 -translate-y-1/2 
                    flex items-center gap-6 
                    bg-black/40 backdrop-blur-md px-6 py-3 
                    rounded-full text-white shadow-md
                  "
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FF5252" }} />
                    <span className="text-sm">영화</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#5B8FF9" }} />
                    <span className="text-sm">배우</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#F6BD16" }} />
                    <span className="text-sm">감독</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#E040FB" }} />
                    <span className="text-sm">감독 겸 배우</span>
                  </div>
                </div>
              )}

              {/* 중앙 검색바 */}
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

              {/* 전체보기 버튼 */}
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
        </div>

        {/* 그래프 영역 */}
        <div className="flex-1 w-full min-h-0 relative overflow-hidden px-6 pb-3">
          {graphType === "movie" && (
            <BipartiteGraph
              resetViewFlag={resetViewFlag}
              searchTerm={searchTerm}
              onNoResult={handleNoResult}
            />
          )}

          {graphType === "ego" && (
            <EgoGraph
              resetViewFlag={resetViewFlag}
              searchTerm={searchTerm}
              onNoResult={handleNoResult}
            />
          )}

          {graphType === "collaboration" && (
            <CollabNetworkGraph
              resetViewFlag={resetViewFlag}
              searchTerm={searchTerm}
              onNoResult={handleNoResult}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphDetail;
