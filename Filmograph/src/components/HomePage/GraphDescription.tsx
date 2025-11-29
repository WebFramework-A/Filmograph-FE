import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";

type NodeType = {
  id: string;
  label: string;
  type?: "movie" | "person";
  role?: "director" | "actor" | "staff";
  group?: number;
  val?: number;
};

type LinkType = {
  source: string;
  target: string;
  weight?: number;
};

type GraphDataType = {
  nodes: NodeType[];
  links: LinkType[];
};

const DUMMY_DATA: Record<string, GraphDataType> = {
  "001": {
    nodes: [
      { id: "M1", label: "기생충", type: "movie", val: 6 },
      { id: "M2", label: "설국열차", type: "movie", val: 6 },
      { id: "M3", label: "괴물", type: "movie", val: 6 },
      { id: "M4", label: "살인의 추억", type: "movie", val: 6 },
      { id: "P1", label: "봉준호", type: "person", role: "director", val: 6 },
      { id: "P2", label: "송강호", type: "person", role: "actor", val: 6 },
      { id: "P3", label: "최우식", type: "person", role: "actor", val: 6 },
      { id: "P4", label: "고아성", type: "person", role: "actor", val: 6 },
      { id: "P5", label: "틸다 스윈튼", type: "person", role: "actor", val: 6 },
    ],
    links: [
      { source: "M1", target: "P1" },
      { source: "M1", target: "P2" },
      { source: "M1", target: "P3" },
      { source: "M2", target: "P1" },
      { source: "M2", target: "P2" },
      { source: "M2", target: "P4" },
      { source: "M2", target: "P5" },
      { source: "M3", target: "P1" },
      { source: "M3", target: "P2" },
      { source: "M3", target: "P4" },
      { source: "M4", target: "P1" },
      { source: "M4", target: "P2" },
    ],
  },
  "002": {
    nodes: [
      { id: "P1", label: "봉준호", role: "director", val: 10 },
      { id: "P2", label: "송강호", role: "actor", val: 8 },
      { id: "P3", label: "변희봉", role: "actor", val: 6 },
      { id: "P4", label: "배두나", role: "actor", val: 5 },
      { id: "P5", label: "박해일", role: "actor", val: 5 },
      { id: "S1", label: "홍경표(촬영)", role: "staff", val: 4 },
    ],
    links: [
      { source: "P1", target: "P2", weight: 12 },
      { source: "P1", target: "P3", weight: 8 },
      { source: "P1", target: "P4", weight: 2 },
      { source: "P1", target: "P5", weight: 2 },
      { source: "P1", target: "S1", weight: 2 },
    ],
  },
  "003": {
    nodes: [
      { id: "P1", label: "봉준호", group: 1, val: 10 },
      { id: "P2", label: "송강호", group: 1, val: 8 },
      { id: "P3", label: "최우식", group: 1, val: 5 },
      { id: "P4", label: "박소담", group: 1, val: 5 },
      { id: "D1", label: "박찬욱", group: 2, val: 9 },
      { id: "A1", label: "최민식", group: 2, val: 7 },
      { id: "A2", label: "유지태", group: 2, val: 5 },
    ],
    links: [
      { source: "P1", target: "P2" },
      { source: "P1", target: "P3" },
      { source: "P1", target: "P4" },
      { source: "P2", target: "P3" },
      { source: "P2", target: "P4" },
      { source: "D1", target: "A1" },
      { source: "D1", target: "A2" },
      { source: "A1", target: "A2" },
      { source: "P2", target: "D1" },
    ],
  },
};

const GraphDescription = () => {
  const navigate = useNavigate();

  const items = [
    {
      id: "001",
      text: "영화-영화인 그래프",
      url: "/graph/movie",
      type: "bipartite",
    },
    { id: "002", text: "에고 네트워크", url: "/graph/ego", type: "ego" },
    {
      id: "003",
      text: "협업 네트워크 & 커뮤니티",
      url: "/graph/collaboration",
      type: "collab",
    },
  ];

  const [currentId, setCurrentId] = useState("001");
  const [isAnimating, setIsAnimating] = useState(false);

  // 그래프 제어를 위한 ref
  const fgRef = useRef<ForceGraphMethods>();
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;

        requestAnimationFrame(() => {
          setDimensions({ width, height });
        });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 데이터 변경 시 물리 엔진 설정+그래프 확대하기 위해 둠
  useEffect(() => {
    if (fgRef.current) {
      // 물리 엔진 힘 설정
      fgRef.current.d3Force("charge")?.strength(-100);
      fgRef.current.d3Force("link")?.distance(0);

      // 렌더링 직후 즉시 확대 (setTimeout 0을 주어 사이클 충돌 방지)
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoom(4);
          fgRef.current.centerAt(0, 0);
        }
      }, 0);

      fgRef.current.d3ReheatSimulation();
    }
  }, [currentId]);

  const handleMouseEnter = (id: string) => {
    if (currentId === id) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentId(id);
      setIsAnimating(false);
    }, 200);
  };

  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D) => {
      const currentItem = items.find((i) => i.id === currentId);
      const type = currentItem?.type || "bipartite";
      const label = node.label;
      const size = (node.val ?? 5) * 0.7;

      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);

      if (type === "bipartite") {
        ctx.fillStyle = node.type === "movie" ? "#FF5252" : "#5B8FF9";
      } else if (type === "ego") {
        const roleColors: Record<string, string> = {
          director: "#FFD700",
          actor: "#4FC3F7",
          staff: "#FF8A65",
        };
        ctx.fillStyle = roleColors[node.role] || "#999";
      } else {
        const groupColors = ["#5B8FF9", "#5AD8A6", "#F6BD16", "#E8684A"];
        ctx.fillStyle = groupColors[(node.group || 0) % groupColors.length];
      }
      ctx.fill();

      // 텍스트 그리기
      const fontSize = Math.max(size * 0.9, 2);
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, node.x, node.y);
    },
    [currentId]
  );

  return (
    <div className="min-h-screen snap-start flex flex-col items-center pt-50 bg-yellow-200">
      <div className="text-5xl mb-5 text-[#0b4747]">그래프 종류</div>

      <button
        className="border border-[#0b4747]/50 rounded-4xl hover:bg-[#0b4747] hover:text-white duration-400 px-4 py-2 cursor-pointer transition-colors"
        onClick={() => navigate("/graph")}
      >
        전체 그래프 보러가기
      </button>

      <div className="flex justify-center items-center w-full max-w-7xl px-10 py-5 gap-10  h-[500px]">
        {/* 좌측 (리스트) */}
        <div className="w-[60%] flex flex-col text-[#0b4747]">
          <div className="w-full border-t border-[#0b4747]/50"></div>
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer overflow-hidden"
              onMouseEnter={() => handleMouseEnter(item.id)}
              onClick={() => navigate(item.url)}
            >
              <div className="flex items-center py-6 px-2 transition-colors duration-300 relative z-10">
                <div className="absolute left-35 right-0 h-px bg-[#0b4747] opacity-0 -translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out flex items-center">
                  <span className="absolute right-0 text-2xl text-[#0b4747] -mt-1">
                    &gt;
                  </span>
                </div>
                <span
                  className={`text-5xl font-serif italic tracking-tighter mr-8 transition-colors duration-200 ${
                    currentId === item.id
                      ? "text-[#0b4747]"
                      : "text-[#0b4747]/50"
                  }`}
                >
                  {item.id}
                </span>
                <span
                  className={`text-2xl md:text-3xl transition-colors duration-200 bg-yellow-200 pr-4 z-20 ${
                    currentId === item.id
                      ? "text-[#0b4747]"
                      : "text-[#0b4747]/50"
                  }`}
                >
                  {item.text}
                </span>
              </div>
              <div className="w-full border-b border-[#0b4747]/50"></div>
            </div>
          ))}
        </div>

        {/* 우측 (그래프)*/}
        <div
          ref={graphContainerRef}
          className="w-[50%] h-full flex items-center justify-center relative  rounded-3xl overflow-hidden "
        >
          <div
            className={`
              w-full h-full absolute inset-0
              transform transition-all duration-500 ease-in-out
              ${
                isAnimating
                  ? "opacity-0 scale-95 blur-sm"
                  : "opacity-100 scale-100 blur-0"
              }
            `}
          >
            {dimensions.width > 0 && dimensions.height > 0 && (
              <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={DUMMY_DATA[currentId]}
                backgroundColor="transparent"
                nodeLabel=""
                linkColor={() => "#0b4747"}
                linkWidth={(link: any) => (link.weight ? link.weight : 1)}
                nodeCanvasObject={drawNode}
                cooldownTicks={100}
                d3VelocityDecay={0.3}
              />
            )}
          </div>
          <div className="absolute bottom-4 right-6 text-gray-800 text-sm italic">
            ※ 봉준호 감독 관련 예시 데이터입니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphDescription;
