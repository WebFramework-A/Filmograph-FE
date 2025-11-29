import { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const MOVIE_COLOR = "#FF5252";
const ACTOR_COLOR = "#5B8FF9";
const DIRECTOR_COLOR = "#F6BD16";

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

    { id: "m9", name: "영화9", type: "movie", val: 3 },
    { id: "m10", name: "영화10", type: "movie", val: 3 },
    { id: "m11", name: "영화11", type: "movie", val: 3 },
    { id: "d5", name: "감독5", type: "person", role: "director", val: 2 },
    { id: "a7", name: "배우7", type: "person", role: "actor", val: 2 },
    { id: "a8", name: "배우8", type: "person", role: "actor", val: 2 },
    { id: "a9", name: "배우9", type: "person", role: "actor", val: 2 },
    { id: "a10", name: "배우10", type: "person", role: "actor", val: 2 },
    { id: "a11", name: "배우11", type: "person", role: "actor", val: 2 },
    { id: "a12", name: "배우12", type: "person", role: "actor", val: 2 },
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

    { source: "m9", target: "d5" },
    { source: "m9", target: "a7" },
    { source: "m9", target: "a8" },

    { source: "m10", target: "d5" },
    { source: "m10", target: "a8" },
    { source: "m10", target: "a9" },
    { source: "m10", target: "a10" },

    { source: "m11", target: "d2" },
    { source: "m11", target: "a11" },
    { source: "m11", target: "a12" },

    { source: "a7", target: "m2" },
    { source: "a9", target: "a11" },
    { source: "a12", target: "m8" },
    { source: "d5", target: "d4" },
  ],
};

export default function DecorativeGraph() {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

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
      // 노드끼리 밀어내는 힘 (절댓값이 클수록 멀리 밀어냄)
      fgRef.current.d3Force("charge").strength(-150);

      // 연결된 노드 사이의 거리
      fgRef.current.d3Force("link").distance(100);
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
        enableNodeDrag={true}
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
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const size = node.type === "movie" ? 8 : 6;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}
