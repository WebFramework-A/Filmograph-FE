import { useState } from "react";

import Searchbar from "../components/common/Searcrbar";
import GuideCard from "../components/GraphPage/GuideCard";
import CategoryWithDot from "../components/common/CategoryWithDot";

import CollabNetworkGraph from "../components/GraphPage/CollabNetworkGraph";
import EgoGraph from "../components/GraphPage/EgoGraph";
import BipartiteGraph from "../components/GraphPage/BipartiteGraph";

type GraphCategory = "bipartite" | "ego" | "community";

const GraphPage = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<GraphCategory>("bipartite");
  // CollabNetworkGraph에게 리셋 신호 보내기
  const [resetViewFlag, setResetViewFlag] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d5a5a] text-white pt-20">
      {/* 헤더 */}
      <div className="pb-4 px-8">
        <h1 className="text-5xl font-bold text-center mb-4 text-[#FFD700]">
          영화 관계망
        </h1>

        <p className="text-center text-white/80 mb-8">
          배우, 감독, 영화를 연결하는 복잡한 관계를 네트워크로 시각화합니다
        </p>

        {/* 검색바 & 줌 */}
        <div className="flex items-center justify-between max-w-6xl mx-auto mb-4">
          <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* 카테고리 버튼 */}
        <div className="flex justify-center gap-3 max-w-3xl mx-auto mb-6">
          <button
            onClick={() => setCategory("bipartite")}
            className={`px-4 py-2 rounded-full text-sm border ${category === "bipartite"
              ? "bg-[#FFD700] text-black border-[#FFD700]"
              : "border-white/40 text-white hover:bg-white/10"
              }`}
          >
            영화–영화인 이분 그래프
          </button>

          <button
            onClick={() => setCategory("ego")}
            className={`px-4 py-2 rounded-full text-sm border ${category === "ego"
              ? "bg-[#FFD700] text-black border-[#FFD700]"
              : "border-white/40 text-white hover:bg-white/10"
              }`}
          >
            에고 네트워크
          </button>

          <button
            onClick={() => setCategory("community")}
            className={`px-4 py-2 rounded-full text-sm border ${category === "community"
              ? "bg-[#FFD700] text-black border-[#FFD700]"
              : "border-white/40 text-white hover:bg-white/10"
              }`}
          >
            협업 네트워크 & 커뮤니티
          </button>
        </div>
      </div>

      {/* 그래프 영역 */}
      <div className="relative bg-[#0d5a5a] mx-8 rounded-lg overflow-hidden border border-white/10">

        {/* 협업 네트워크, 이분그래프일 때 전체 보기 버튼 표시 */}
        {(category === "bipartite" || category === "community") && (
          <button
            onClick={() => setResetViewFlag(prev => !prev)}
            className="
              absolute top-4 right-4 z-20
              bg-white/10 text-white border border-white/30
              px-4 py-1.5 rounded-full text-xs font-medium
              hover:bg-white/20 transition
            "
          >
            전체 그래프 보기
          </button>
        )}

        <div style={{ height: "500px" }}>
          {category === "bipartite" && (
            <BipartiteGraph resetViewFlag={resetViewFlag} />
          )}
          {category === "ego" && <EgoGraph />}
          {category === "community" && (
            <CollabNetworkGraph resetViewFlag={resetViewFlag} />
          )}
        </div>
      </div>

      {/* 범례 위치 이동: 그래프 박스 아래로 배치 */}
      {category === "bipartite" && (
        <div className="flex justify-center mt-6 mb-2">
          <div className="flex items-center gap-6 bg-black/20 px-6 py-2 rounded-full border border-white/10">
            <CategoryWithDot color="#4FC3F7" label="배우" />
            <CategoryWithDot color="#FFD700" label="감독" />
            <CategoryWithDot color="#FF6B6B" label="영화" />
          </div>
        </div>
      )}

      {/* 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-12 max-w-6xl mx-auto">
        <GuideCard
          title="드래그로 이동"
          description="캔버스를 클릭하여 드래그하여 여러 네트워크를 이동할 수 있습니다"
        />
        <GuideCard
          title="노드 클릭"
          description="배우, 감독, 영화 노드를 클릭하여 상세 정보를 확인하고 관계를 탐색할 수 있습니다"
        />
        <GuideCard
          title="줌 조절"
          description="줌 버튼을 사용하여 네트워크를 확대/축소할 수 있습니다"
        />
      </div>
    </div>
  );
};

export default GraphPage;