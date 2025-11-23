import { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const MOVIE_COLOR = "#FF5252";
const ACTOR_COLOR = "#5B8FF9";
const DIRECTOR_COLOR = "#F6BD16";

// 샘플 데이터 (장식용. 메인 페이지에서 화면 채우려고 넣은거임)
const sampleGraphData = {
  nodes: [
    { id: "m1", name: "영화1", type: "movie", val: 3 },
    { id: "m2", name: "영화2", type: "movie", val: 3 },
    { id: "m3", name: "영화3", type: "movie", val: 3 },
    { id: "m4", name: "영화4", type: "movie", val: 3 },
    { id: "m5", name: "영화5", type: "movie", val: 3 },
    { id: "m6", name: "영화6", type: "movie", val: 3 },
    { id: "m7", name: "영화7", type: "movie", val: 3 },
    { id: "m8", name: "영화8", type: "movie", val: 3 },
    { id: "a1", name: "배우1", type: "person", role: "actor", val: 2 },
    { id: "a2", name: "배우2", type: "person", role: "actor", val: 2 },
    { id: "a3", name: "배우3", type: "person", role: "actor", val: 2 },
    { id: "a4", name: "배우4", type: "person", role: "actor", val: 2 },
    { id: "a5", name: "배우5", type: "person", role: "actor", val: 2 },
    { id: "a6", name: "배우6", type: "person", role: "actor", val: 2 },
    { id: "d1", name: "감독1", type: "person", role: "director", val: 2 },
    { id: "d2", name: "감독2", type: "person", role: "director", val: 2 },
    { id: "d3", name: "감독3", type: "person", role: "director", val: 2 },
    { id: "d4", name: "감독4", type: "person", role: "director", val: 2 },
  ],
  links: [
    { source: "m1", target: "a1" },
    { source: "m1", target: "d1" },
    { source: "m2", target: "a1" },
    { source: "m2", target: "a2" },
    { source: "m2", target: "d1" },
    { source: "m3", target: "a2" },
    { source: "m3", target: "a3" },
    { source: "m3", target: "d2" },
    { source: "m4", target: "a3" },
    { source: "m4", target: "d2" },
    { source: "m5", target: "a4" },
    { source: "m5", target: "a5" },
    { source: "m5", target: "d3" },
    { source: "m6", target: "a4" },
    { source: "m6", target: "d3" },
    { source: "m7", target: "a5" },
    { source: "m7", target: "a6" },
    { source: "m7", target: "d4" },
    { source: "m8", target: "a6" },
    { source: "m8", target: "d4" },
    { source: "a1", target: "a2" },
    { source: "a3", target: "a4" },
    { source: "a5", target: "a6" },
  ],
};

export default function DecorativeGraph() {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth || 800,
          height: offsetHeight || 600,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 80);
      }, 100);
    }
  }, [dimensions]);

  useEffect(() => {
    if (fgRef.current) {
      // d3Force 설정
      fgRef.current.d3Force("charge").strength(-30);
      fgRef.current.d3Force("link").distance(60);
    }
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full opacity-80">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        graphData={sampleGraphData}
        nodeId="id"
        nodeLabel={() => ""}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
        warmupTicks={100}
        cooldownTicks={200}
        linkColor={() => "rgba(255,255,255,0.2)"}
        linkWidth={1}
        nodeCanvasObject={(rawNode: any, ctx) => {
          const node = rawNode;
          if (node.x === undefined || node.y === undefined) return;

          const size = node.type === "movie" ? 8 : 6;
          let color = ACTOR_COLOR;

          if (node.type === "movie") {
            color = MOVIE_COLOR;
          } else if (node.role === "director") {
            color = DIRECTOR_COLOR;
          }

          // 노드 글로우 효과
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            size * 2
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 2, 0, 2 * Math.PI, false);
          ctx.fill();

          // 노드 본체
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}
