// src/components/GraphPage/EgoGraph.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";

import type {
  ForceGraphMethods,
  NodeObject,
  LinkObject,
} from "react-force-graph-2d";

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
};

type GraphT = {
  nodes: NodeT[];
  links: LinkT[];
};

// ---- props ----
export default function EgoGraph({
  resetViewFlag,
  searchTerm,
  onNoResult,
}: {
  resetViewFlag: boolean;
  searchTerm: string;
  onNoResult: () => void;
}) {
  const ROLE_COLORS = {
    actor: "#4FC3F7",
    director: "#FFD700",
    staff: "#FF8A65",
  };

  const [allPersons, setAllPersons] = useState<
    { id: string; label: string }[]
  >([]);

  const [data, setData] = useState<GraphT | null>(null);
  const [filteredData, setFilteredData] = useState<GraphT | null>(null);
  const [centerPerson, setCenterPerson] = useState<{
    id: string;
    label: string;
    role?: string;
  } | null>(null);

  const fgRef = useRef<
    ForceGraphMethods<NodeObject<NodeT>, LinkObject<NodeT, LinkT>> | undefined
  >(undefined);

  // Firestore 전체 egoGraphs 목록 불러오기
  async function loadAllEgoGraphs() {
    const ref = collection(db, "egoGraphs");
    const snap = await getDocs(ref);

    return snap.docs.map((d) => {
      const raw = d.data() as any;
      return {
        id: d.id,
        label: raw.label ?? "",
      };
    });
  }

  useEffect(() => {
    async function init() {
      const list = await loadAllEgoGraphs();
      setAllPersons(list);
    }
    init();
  }, []);

  // 특정 id의 에고그래프 데이터 fetch
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

  // 에고그래프 로드
  const loadGraph = useCallback(async (id: string) => {
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
  }, []);

  // 역할 → 색상 매핑
  const mapRole = (role?: string): "actor" | "director" | "staff" => {
    if (!role) return "actor";
    if (role.includes("배우") || role.includes("출연") || role.includes("단역"))
      return "actor";
    if (role.includes("감독") || role.includes("연출") || role.includes("조감독"))
      return "director";
    return "staff";
  };

  const getNodeId = (x: any): string =>
    typeof x === "object" ? String(x.id) : String(x);

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

    // 위치 초기화
    filteredNodes.forEach((n) => {
      n.x = n.y = n.vx = n.vy = n.fx = n.fy = undefined;
    });

    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  }, [data, centerPerson]);

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

  const graphData = useMemo(
    () => filteredData ?? { nodes: [], links: [] },
    [filteredData]
  );

  useEffect(() => {
    if (!searchTerm.trim() || allPersons.length === 0) return;

    const keyword = searchTerm.trim().toLowerCase();

    const found = allPersons.find((p) =>
      p.label.toLowerCase().includes(keyword)
    );

    if (!found) {
      onNoResult();
      return;
    }

    loadGraph(found.id);

  }, [searchTerm, allPersons]);

  useEffect(() => {
    if (!fgRef.current) return;

    // 초기화
    setCenterPerson(null);
    setData(null);
    setFilteredData(null);

    // force 초기화
    fgRef.current.d3Force("charge")?.strength(-120);
    fgRef.current.d3Force("link")?.strength(0.1);
  }, [resetViewFlag]);

  // zoomToFit
  useEffect(() => {
    if (!fgRef.current) return;

    if (!graphData.nodes.length) return;

    fgRef.current.d3Force("link")?.distance(50);
    fgRef.current.d3Force("link")?.strength(0.6);
    fgRef.current.d3Force("charge")?.strength(-60);

    const timer = setTimeout(() => {
      fgRef.current?.zoomToFit(600, 80);
    }, 400);

    return () => clearTimeout(timer);
  }, [graphData]);

  if (!data || !filteredData || !centerPerson) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: "550px" }}
      >
        <div className="text-white text-xl font-semibold opacity-80">
          검색할 인물을 입력해주세요.
        </div>
      </div>
    );
  }

  // 렌더링
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative pb-15">
      <ForceGraph2D<NodeT, LinkT>
        ref={fgRef}
        width={window.innerWidth * 0.9}
        height={430}
        graphData={graphData}
        backgroundColor="transparent"
        nodeId="id"
        enableNodeDrag={true}
        linkColor={() => "rgba(255,255,255,0.7)"}
        linkWidth={(l) => {
          const w = l.weight ?? 1;
          const norm = (w - minW) / (maxW - minW || 1);
          return 2 + Math.sqrt(norm) * 10;
        }}
        nodeCanvasObject={(raw, ctx) => {
          const node = raw as NodeT & { x: number; y: number };
          const isCenter = String(node.id) === egoId;

          const w = filteredData.links.find(
            (l) =>
              getNodeId(l.source) === String(node.id) ||
              getNodeId(l.target) === String(node.id)
          )?.weight ?? 1;

          const norm = (w - minW) / (maxW - minW || 1);
          const eased = Math.sqrt(norm);

          let size = 6 + eased * 4;
          if (isCenter) size = 12;

          const fontSize = Math.min(14, size * 0.8);

          const category = mapRole(node.role);
          const color = ROLE_COLORS[category];

          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.lineWidth = 1;
          ctx.strokeStyle = color;
          ctx.strokeText(node.label, node.x, node.y);

          ctx.fillStyle = "black";
          ctx.fillText(node.label, node.x, node.y);
        }}
        onNodeClick={(node) => loadGraph(String(node.id))}
      />

      {/* 범례 */}
      <div
        className="
          absolute bottom-4 left-1/2 -translate-x-1/2 
          flex items-center gap-6 
          bg-black/40 backdrop-blur-md px-6 py-3 
          rounded-full text-white
        "
      >
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
