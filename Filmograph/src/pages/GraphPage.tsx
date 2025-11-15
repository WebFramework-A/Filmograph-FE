import { useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import getGraphData from "../services/firestoreApi";
import type { GraphData } from "../types/data";
import { ZoomIn, ZoomOut } from "lucide-react";
import Searchbar from "../components/common/Searcrbar";
import GuideCard from "../components/GraphPage/GuideCard";
import CategoryWithDot from "../components/common/CategoryWithDot";
import CollabNetworkGraph from "../components/GraphPage/CollabNetworkGraph";
import EgoGraph from "../components/GraphPage/EgoGraph";

type GraphCategory = "bipartite" | "ego" | "community";

const GraphPage = () => {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] }); // 그래프 데이터 넣어줄 state
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리하는 state
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [zoom, setZoom] = useState(100); // 줌 레벨
  const [category, setCategory] = useState<GraphCategory>("bipartite");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const graphData = await getGraphData();

        setData(graphData);
      } catch (error) {
        console.error("그래프 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); //초기 마운트시에만 실행

  // 줌 인
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  // 줌 아웃
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  // 로딩중 UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d5a5a]">
        <div className="text-white text-xl">
          그래프 데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-[#0d5a5a] text-white">
      {/* 헤더 섹션 */}
      <div className="pt-16 pb-4 px-8">
        <h1 className="text-5xl font-bold text-center mb-4 text-[#FFD700]">
          영화 관계망
        </h1>

        <p className="text-center text-white/80 mb-8">
          배우, 감독, 영화를 연결하는 복잡한 관계를 네트워크로 시각화합니다
        </p>

        {/* 검색바 & 줌 컨트롤 */}
        <div className="flex items-center justify-between max-w-6xl mx-auto mb-4">
          <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/10 rounded transition"
              aria-label="줌 아웃"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm min-w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/10 rounded transition"
              aria-label="줌 인"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
        {/* 카테고리 선택 버튼 */}
        <div className="flex justify-center gap-3 max-w-3xl mx-auto mb-4">
          <button
            onClick={() => setCategory("bipartite")}
            className={`px-4 py-2 rounded-full text-sm border ${
              category == "bipartite"
                ? "bg-[#FFD700] text-black border-[#FFD700]"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            영화–영화인 이분 그래프
          </button>
          <button
            onClick={() => setCategory("ego")}
            className={`px-4 py-2 rounded-full text-sm border ${
              category == "ego"
                ? "bg-[#FFD700] text-black border-[#FFD700]"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            에고 네트워크
          </button>
          <button
            onClick={() => setCategory("community")}
            className={`px-4 py-2 rounded-full text-sm border ${
              category == "community"
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
      
        <div style={{ height: "500px" }}>
           {/* 영화–영화인 이분 그래프 (기존 예시 그래프 냅둠) */}
            {category == "bipartite" && (
          <ForceGraph2D
            graphData={data}
            backgroundColor="#0d5a5a"
            nodeLabel="id"
            nodeAutoColorBy="group"
          />
        )}
         {/* 에고 네트워크 */}
          {category == "ego" && <EgoGraph />}

          {/* 협업 네트워크 & 커뮤니티 */}
          {category == "community" && <CollabNetworkGraph />}
        </div>

        {/* 종류 */}
         {category == "bipartite" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full">
            <CategoryWithDot color="#4FC3F7" label="배우" />
            <CategoryWithDot color="#FFD700" label="감독" />
            <CategoryWithDot color="#FF6B6B" label="영화" />
          </div>
        )}
      </div>

      {/* 하단 가이드 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-12 max-w-6xl mx-auto">
        <GuideCard
          title="드래그로 이동"
          description="캔버스를 클릭하여 드래그하여 여러 네트워크를 이동할 수 있습니다"
        />

        {/* 노드 클릭 */}
        <GuideCard
          title="노드 클릭"
          description="배우, 감독, 영화 노드를 클릭하여 상세 정보를 확인하고 관계를 탐색할 수 있습니다"
        />

        {/* 줌 조절 */}
        <GuideCard
          title="줌 조절"
          description="줌 버튼을 사용하여 네트워크를 확대/축소할 수 있습니다"
        />
      </div>
    </div>
  );
};

export default GraphPage;
