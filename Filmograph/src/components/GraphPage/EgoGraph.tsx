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

const COLORS = [
  "#5B8FF9",
  "#5AD8A6",
  "#F6BD16",
  "#E8684A",
  "#6F5EF9",
  "#52C41A",
  "#EB2F96",
];

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

// ego ↔ node 간 weight
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

  const fgRef = useRef<ForceGraphMethods | null>(null);
  const lastClickRef = useRef<{ id: string | null; time: number }>({
    id: null,
    time: 0,
  });

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

    // ego에 직접 연결된 링크만
    const filteredLinks = data.links.filter((l) => {
      const s = getNodeId(l.source);
      const t = getNodeId(l.target);
      return s === egoId || t === egoId;
    });

    // ego와 연결된 노드만
    const allowed = new Set([egoId]);
    filteredLinks.forEach((l) => {
      allowed.add(getNodeId(l.source));
      allowed.add(getNodeId(l.target));
    });

    // 필터링된 노드 생성
    const filteredNodes = data.nodes.filter((n) =>
      allowed.has(String(n.id))
    );

    // 좌표 초기화
    filteredNodes.forEach((n) => {
      if (typeof n.x !== "number") {
        n.x = 0;
        n.y = 0;
      }
    });

    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  }, [data, centerPerson]);

  // weight 범위 계산
  const egoId = centerPerson?.id ?? null;

  const { minW, maxW } = useMemo(() => {
    if (!filteredData || !egoId) return { minW: 1, maxW: 1 };

    const weights = filteredData.links
      .filter(
        (l) =>
          getNodeId(l.source) === egoId ||
          getNodeId(l.target) === egoId
      )
      .map((l) => l.weight ?? 1);

    return {
      minW: Math.min(...weights),
      maxW: Math.max(...weights),
    };
  }, [filteredData, egoId]);

  const graphData = filteredData ?? { nodes: [], links: [] };

  // 그래프 렌더 후 자동 zoomToFit
  useEffect(() => {
    if (!fgRef.current || graphData.nodes.length === 0) return;

    setTimeout(() => {
      fgRef.current?.zoomToFit(800, 150);
    }, 300);
  }, [graphData]);

  // 중심 변경 시 자동 zoomToFit
  useEffect(() => {
    if (!fgRef.current || !centerPerson) return;

    setTimeout(() => {
      fgRef.current?.zoomToFit(800, 150);
    }, 300);
  }, [centerPerson]);


  if (!filteredData || !centerPerson)
    return <div className="text-white">Ego Network 불러오는 중...</div>;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-white mb-4">
        {centerPerson.role && (
          <span className="text-blue-300">({centerPerson.role}) </span>
        )}
        {centerPerson.label}의 Ego Network
      </h2>

      <ForceGraph2D<NodeT, LinkT>
        ref={fgRef}
        width={1000}
        height={550}
        backgroundColor="transparent"
        graphData={graphData}
        nodeId="id"
        enableNodeDrag={true}
        warmupTicks={120}
        cooldownTicks={360}
        cooldownTime={6000}
        linkColor={() => "rgba(255,255,255,0.7)"}

        d3Force={(name, force) => {
          if (name === "charge") {
            force.strength(-120);
          }
          if (name === "collide") {
            force.radius((node: any) => {
              const w = getWeightBetween(
                egoId!,
                node.id,
                graphData.links
              );
              const norm = normalizeWeight(w, minW, maxW);
              const eased = Math.sqrt(norm);
              const size = 8 + eased * 12;
              return size * 3;
            });
          }
          return force;
        }}

        linkStrength={() => 0.1}

        // 링크 두께
        linkWidth={(l) => {
          const norm = normalizeWeight(l.weight ?? 1, minW, maxW);
          return 2 + norm * 10;
        }}

        // Node 생성
        nodeCanvasObject={(raw, ctx, scale) => {
          const node = raw as NodeT & { x: number; y: number };
          const isCenter = String(node.id) === egoId;

          const w = getWeightBetween(egoId!, node.id, graphData.links);
          const norm = normalizeWeight(w, minW, maxW);
          const eased = Math.sqrt(norm);

          let size = 4 + eased * 4;
          if (isCenter) size = 12;

          const color = COLORS[(node.community ?? 0) % COLORS.length];

          // 중심 노드
          if (isCenter) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fill();
          }

          // 노드 원
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          // 이름 라벨
          const fontSize = (isCenter ? 16 : 12) / scale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = "white";

          const text = node.label;
          const textWidth = ctx.measureText(text).width;

          ctx.fillText(
            text,
            node.x - textWidth / 2,
            node.y + fontSize / 3
          );
        }}

        // Node Double-click: 중심 변경
        onNodeClick={async (node) => {
          const id = String(node.id);
          const now = Date.now();

          if (
            lastClickRef.current.id === id &&
            now - lastClickRef.current.time < 300
          ) {
            await loadGraph(id);
          }
          lastClickRef.current = { id, time: now };
        }}

        // Background click: zoomToFit
        onBackgroundClick={() => {
          fgRef.current?.zoomToFit(800, 150);
        }}
      />
    </div>
  );
}