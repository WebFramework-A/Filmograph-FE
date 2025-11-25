// src/components/GraphPage/EgoGraph.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";

// 타입 정의
type NodeT = NodeObject & {
  id: string | number;
  label: string;
  community?: number;
  role?: string;
  degree?: number;
  movies_count?: number;
};

type LinkT = LinkObject<NodeT> & {
  source: string | number | NodeT;
  target: string | number | NodeT;
  weight?: number;
  movies?: string[];
};

type GraphT = {
  nodes: NodeT[];
  links: LinkT[];
};

const DEFAULT_EGO_ID = "10004308";

// 역할 색상
const ROLE_COLORS = {
  actor: "#4FC3F7",
  director: "#FFD700",
  staff: "#FF8A65",
};

// 역할 매핑
function mapRole(role?: string): "actor" | "director" | "staff" {
  if (!role) return "actor";
  if (role.includes("배우") || role.includes("출연") || role.includes("단역"))
    return "actor";
  if (role.includes("감독") || role.includes("연출") || role.includes("조감독"))
    return "director";
  return "staff";
}

// Firestore 로드
async function fetchEgoGraph(id: string): Promise<GraphT | null> {
  try {
    const ref = doc(db, "egoGraphs", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const raw = snap.data() as any;
    return { nodes: raw.nodes, links: raw.links };
  } catch (e) {
    console.error("Firestore Error:", e);
    return null;
  }
}

// 유틸 함수
function getNodeId(x: any): string {
  return typeof x === "object" ? String(x.id) : String(x);
}

// ego ↔ node weight
function getWeightBetween(
  egoId: string,
  nodeId: string | number,
  links: LinkT[]
): number {
  const eid = String(egoId);
  const nid = String(nodeId);

  const edge = links.find((l) => {
    const s = getNodeId(l.source);
    const t = getNodeId(l.target);
    return (s === eid && t === nid) || (t === eid && s === nid);
  });

  return edge?.weight ?? 1;
}

// weight 정규화
function normalizeWeight(w: number, minW: number, maxW: number): number {
  if (minW === maxW) return 0.5;
  return (w - minW) / (maxW - minW);
}

// 메인 컴포넌트
export default function EgoGraph() {
  const [data, setData] = useState<GraphT | null>(null);
  const [filteredData, setFilteredData] = useState<GraphT | null>(null);
  const [centerPerson, setCenterPerson] = useState<{
    id: string;
    label: string;
    role?: string;
  } | null>(null);

  // ⭐ hoverNode 삭제 (사용 안 해서 ESLint 제거)
  // const [hoverNode, setHoverNode] = useState<NodeT | null>(null);

  // ⭐ ForceGraph ref 타입 완전한 제네릭 적용
  const fgRef = useRef<ForceGraphMethods<NodeT, LinkT> | null>(null);

  // 초기 로드
  useEffect(() => {
    loadGraph(DEFAULT_EGO_ID);
  }, []);

  async function loadGraph(id: string) {
    const d = await fetchEgoGraph(id);
    if (!d) return;

    setData(d);

    const center = d.nodes.find((n) => String(n.id) === id);
    if (center) {
      setCenterPerson({
        id,
        label: center.label,
        role: center.role,
      });
    }
  }

  // 1-hop 필터링
  useEffect(() => {
    if (!data || !centerPerson) return;

    const egoId = centerPerson.id;

    const filteredLinks = data.links.filter((l) => {
      const s = getNodeId(l.source);
      const t = getNodeId(l.target);
      return s === egoId || t === egoId;
    });

    const allowed = new Set([egoId]);
    filteredLinks.forEach((l) => {
      allowed.add(getNodeId(l.source));
      allowed.add(getNodeId(l.target));
    });

    const filteredNodes = data.nodes.filter((n) =>
      allowed.has(String(n.id))
    );

    // 좌표 초기화
    filteredNodes.forEach((n) => {
      n.x = undefined;
      n.y = undefined;
      n.vx = undefined;
      n.vy = undefined;
      n.fx = undefined;
      n.fy = undefined;
    });

    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  }, [data, centerPerson]);

  // weight 범위
  const egoId = centerPerson?.id ?? null;

  const { minW, maxW } = useMemo(() => {
    if (!filteredData || !egoId) return { minW: 1, maxW: 1 };

    const weights = filteredData.links
      .filter((l) => {
        const s = getNodeId(l.source);
        const t = getNodeId(l.target);
        return s === egoId || t === egoId;
      })
      .map((l) => l.weight ?? 1);

    return {
      minW: Math.min(...weights),
      maxW: Math.max(...weights),
    };
  }, [filteredData, egoId]);

  // ⭐ graphData useMemo 적용 (ESLint 경고 제거)
  const graphData = useMemo(
    () => filteredData ?? { nodes: [], links: [] },
    [filteredData]
  );

  // zoomToFit 처리
  useEffect(() => {
    if (!fgRef.current || graphData.nodes.length === 0) return;

    setTimeout(() => {
      fgRef.current?.zoomToFit(800, 100);
    }, 300);
  }, [graphData, centerPerson]);

  if (!filteredData || !centerPerson)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-white text-xl font-semibold">
          그래프 불러오는 중 · · ·
        </div>
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative pb-24">

      {/* ⭐ 타이틀 완전히 제거됨 */}

      <ForceGraph2D<NodeT, LinkT>
        ref={fgRef}
        width={window.innerWidth * 0.9}
        height={430}
        backgroundColor="transparent"
        graphData={graphData}
        nodeId="id"
        enableNodeDrag={true}
        linkColor={() => "rgba(255,255,255,0.7)"}
        
        // ⭐ 타입 오류 해결: name, force 타입 지정
        d3Force={(name: string, force: any) => {
          if (name === "charge") force.strength(-120);
          return force;
        }}

        linkStrength={() => 0.1}

        linkWidth={(l) => {
          const norm = normalizeWeight(l.weight ?? 1, minW, maxW);
          return 2 + norm * 10;
        }}

        // ⭐ scale 미사용 → 제거하여 eslint 경고 제거
        nodeCanvasObject={(raw, ctx) => {
          const node = raw as NodeT & { x: number; y: number };
          const isCenter = String(node.id) === egoId;

          const w = getWeightBetween(egoId!, node.id, graphData.links);
          const norm = normalizeWeight(w, minW, maxW);
          const eased = Math.sqrt(norm);

          let size = 4 + eased * 4;
          if (isCenter) size = 12;

          const category = mapRole(node.role);
          const color = ROLE_COLORS[category];

          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          const fontSize = size;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const text = node.label;

          ctx.lineWidth = 1;
          ctx.strokeStyle = color;
          ctx.strokeText(text, node.x, node.y);

          ctx.fillStyle = "black";
          ctx.fillText(text, node.x, node.y);
        }}

        onNodeClick={async (node) => {
          await loadGraph(String(node.id));
        }}

        onBackgroundClick={() => {
          fgRef.current?.zoomToFit(800, 100);
        }}
      />

      {/* 하단 설명 */}
      <div className="
        absolute bottom-4 left-1/2 -translate-x-1/2 
        flex items-center gap-6 
        bg-black/40 backdrop-blur-md px-6 py-3 
        rounded-full text-white
      ">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.actor }} />
          <span className="text-sm">배우</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.director }} />
          <span className="text-sm">감독</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.staff }} />
          <span className="text-sm">스태프</span>
        </div>

        <div className="ml-4 flex items-center gap-2 text-white/80 text-sm">
          <span className="w-10 h-1 bg-white inline-block" />
          <span>링크 두께 = 협업 횟수</span>
        </div>
      </div>
    </div>
  );
}