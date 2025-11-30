// src/components/GraphPage/EgoGraph.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../services/data/firebaseConfig";

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

// 기본 중심 인물 ID
const DEFAULT_EGO_ID = "10047370";

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

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fgRef = useRef<
    ForceGraphMethods<NodeObject<NodeT>, LinkObject<NodeT, LinkT>> | undefined
  >(undefined);

  // 화면 리사이즈 감지
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphHeight = useMemo(() => {
    const isMobile = size.width < 768;
    return isMobile
      ? Math.floor(size.height * 0.68)
      : Math.floor(size.height * 0.82);
  }, [size]);

  // Firestore 전체 egoGraphs 목록 불러오기
  async function loadAllEgoGraphs() {
    const ref = collection(db, "egoGraphs");
    const snap = await getDocs(ref);

    return snap.docs.map((d) => {
      const raw = d.data() as any;
      return { id: d.id, label: raw.label ?? "" };
    });
  }

  useEffect(() => {
    async function init() {
      const list = await loadAllEgoGraphs();
      setAllPersons(list);
    }
    init();
  }, []);

  // 특정 인물 그래프 가져오기
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

  const loadGraph = useCallback(async (id: string) => {
    const fg = fgRef.current;

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

    setTimeout(() => {
      if (fg) {
        fgRef.current?.zoomToFit(600, 160);
      }
    }, 600);
  }, []);


  useEffect(() => {
    if (allPersons.length === 0) return;

    const exists = allPersons.some((p) => p.id === DEFAULT_EGO_ID);
    if (exists) loadGraph(DEFAULT_EGO_ID);
  }, [allPersons, loadGraph]);

  // role 색상 매핑
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

  // 중심 + 1-step 이웃만 필터링
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
        n.x = undefined;
        n.y = 80;
        n.vx = n.vy = undefined;
        n.fx = n.fy = undefined;
    });

    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  }, [data, centerPerson]);

  // weight 계산
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

  // 검색 → 자동 로드
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
  }, [searchTerm, allPersons, loadGraph, onNoResult]);

  useEffect(() => {
    if (!fgRef.current) return;

    setCenterPerson(null);
    setData(null);
    setFilteredData(null);

    fgRef.current.d3Force("charge")?.strength(-200);
    fgRef.current.d3Force("link")?.strength(0.1);
  }, [resetViewFlag]);

  useEffect(() => {
    if (!fgRef.current) return;
    if (!graphData.nodes.length) return;

    fgRef.current.d3Force("link")?.distance(40);
    fgRef.current.d3Force("link")?.strength(0.4);
    fgRef.current.d3Force("charge")?.strength(-150);

  }, [graphData]);

  if (!data || !filteredData || !centerPerson) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: "550px" }}>
        <div className="text-white text-xl font-semibold opacity-80">
          그래프 불러오는 중· · ·
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* 설명바*/}
      <div
        className="w-full flex items-center justify-center gap-6 py-3 text-white text-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.actor }} />
          배우
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.director }} />
          감독
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: ROLE_COLORS.staff }} />
          스태프
        </div>

        <div className="ml-4 flex items-center gap-2 opacity-80">
          <span className="w-10 h-1 bg-white inline-block" />
          링크 두께 = 협업 횟수
        </div>
      </div>

      {/* 그래프 */}
      <div className="w-full h-full relative flex items-center justify-center">
        <ForceGraph2D<NodeT, LinkT>
              ref={fgRef}
              width={size.width}
              height={graphHeight}
              graphData={graphData}
              backgroundColor="transparent"
              nodeId="id"
              enableNodeDrag={true}
              minZoom={0.45}
              maxZoom={2.4}
              linkColor={() => "rgba(255,255,255,0.75)"}
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

                let size = 8 + eased * 4;
                if (isCenter) size = 12;

                const category = mapRole(node.role);
                const color = ROLE_COLORS[category];

                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                ctx.font = `12px sans-serif`;
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
      </div>
    </div>
  );
}