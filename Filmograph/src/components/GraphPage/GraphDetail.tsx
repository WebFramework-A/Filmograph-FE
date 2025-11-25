import { useState } from "react";
import { useParams } from "react-router-dom";
import BipartiteGraph from "./BipartiteGraph";
import CollabNetworkGraph from "./CollabNetworkGraph";
import EgoGraph from "./EgoGraph";

const GraphDetail = () => {
  const { graphType } = useParams();

  //전체 그래프 보기 버튼 재생성
  // 리셋 플래그 상태 관리
  const [resetViewFlag, setResetViewFlag] = useState(false);

  // 버튼 클릭 핸들러
  const handleResetView = () => {
    setResetViewFlag((prev) => !prev);
  };

  return (
    <div className="min-h-screen max-w-full pt-30 bg-[#0d5a5a] text-white overflow-x-hidden relative">
      {/* 제목 */}
      <div className="text-3xl text-center">
        {graphType === "movie" && <div>영화-영화인 네트워크</div>}
        {graphType === "ego" && <div>에고 네트워크</div>}
        {graphType === "collaboration" && <div>협업 네트워크</div>}
      </div>

      {/* 설명 */}
      <div className="text-lg text-center mt-2 text-yellow-100">
        {graphType === "movie" && <div>영화-영화인 네트워크 설명써두기</div>}
        {graphType === "ego" && <div>에고 네트워크 썰명 써두기</div>}
        {graphType === "collaboration" && <div>협업 네트워크 설명 써두기</div>}
      </div>

      {/* 검색바 및 컨트롤 영역 */}
      <div className="relative w-full max-w-6xl mx-auto mt-5 px-4 flex justify-center items-center">

        <div className="text-lg text-center bg-black px-4 py-1 rounded">
          여기에 나중에 검색바 넣어야됨
        </div>

        {/* 3. 전체 그래프 보기 버튼 (EgoGraph 제외하고 표시) */}
        {(graphType === "movie" || graphType === "collaboration") && (
          <button
            onClick={handleResetView}
            className="absolute right-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-full text-sm transition-colors"
          >
            전체 그래프 보기
          </button>
        )}
      </div>

      {/* 그래프 영역 */}
      {/* resetViewFlag props 전달 (false -> resetViewFlag로 변경) */}
      {graphType === "movie" && (
        <div className="w-full max-w-full">
          <BipartiteGraph resetViewFlag={resetViewFlag} />
        </div>
      )}
      {graphType === "ego" && (
        <div className="w-full max-w-full">
          <EgoGraph />
        </div>
      )}
      {graphType === "collaboration" && (
        <div className="w-full max-w-full">
          <CollabNetworkGraph resetViewFlag={resetViewFlag} />
        </div>
      )}
    </div>
  );
};

export default GraphDetail;