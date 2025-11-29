// src/components/GraphPage/CollabNetworkGraph.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";
import * as d3 from "d3-force";
import useGraphSearch from "../../hooks/useGraphSearch";

// 타입 정의 
type NodeT = NodeObject & {
  id: string | number;
  label: string;
  community?: number;
  role?: string;
  degree?: number;
  movies_count?: number;
  neighbors?: Set<string | number>;
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

type CollabNetworkGraphProps = {
  resetViewFlag: boolean;
  searchTerm: string;
  onNoResult: () => void;
};

// 색상 정의
const COLORS = [
  "#5B8FF9",
  "#5AD8A6",
  "#F6BD16",
  "#E8684A",
  "#6F5EF9",
  "#52C41A",
  "#EB2F96",
];

// 카메라 위치
const INITIAL_CENTER_X = 0;
const INITIAL_CENTER_Y = 0; 
const INITIAL_ZOOM = 0.94;

// 링크 관계 계산
const getLinkRelation = (
  link: LinkT,
  selectedNode: NodeT | null,
  getNode: (endpoint: string | number | NodeT) => NodeT | undefined
) => {
  if (!selectedNode) {
    return {
      hasSelected: false,
      sameCommunity: false,
      isConnectedToSelected: false,
    };
  }

  const src = getNode(link.source);
  const tgt = getNode(link.target);

  if (!src || !tgt) {
    return {
      hasSelected: true,
      sameCommunity: false,
      isConnectedToSelected: false,
    };
  }

  const sameCommunity =
    src.community == selectedNode.community &&
    tgt.community == selectedNode.community;

  const isConnectedToSelected =
    src.id == selectedNode.id || tgt.id == selectedNode.id;

  return {
    hasSelected: true,
    sameCommunity,
    isConnectedToSelected,
  };
};

// 라벨 그리기 (원본 그대로)
const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number
) => {
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
};

// 컴포넌트
export default function CollabNetworkGraph({
  resetViewFlag, searchTerm, onNoResult
}: CollabNetworkGraphProps) {
  const [data, setData] = useState<GraphT | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeT | null>(null);
  const focusNode = (node: NodeT | null) => {
    setSelectedNode(node);
  };

  const fgRef = useRef<ForceGraphMethods<NodeT, LinkT> | null>(null);

  // 화면 크기 기반으로 크기 조절
  const [dimensions, setDimensions] = useState({
  width: window.innerWidth * 0.9,
  height: Math.max(window.innerHeight * 0.7, 400),
  });


  useEffect(() => {
    const updateSize = () => {
      // 상단 타이틀/검색바 정도 여백
      const TOP_OFFSET = 250;
      const availableHeight = window.innerHeight - TOP_OFFSET;

      setDimensions({
      width: window.innerWidth * 0.9,
      height: Math.max(availableHeight * 0.97, 400),
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // JSON 로드 (원본 그대로)
  useEffect(() => {
    fetch("/graph/network_data.json")
      .then((res) => res.json())
      .then((json: GraphT) => {
        const { nodes, links } = json;

        const idToNode = new Map<string | number, NodeT>();

        nodes.forEach((node) => {
          node.neighbors = new Set();
          idToNode.set(node.id, node);

          // 초기 위치
          node.y = (node.y ?? 0) - 200;
        });

        links.forEach((link) => {
          const a = idToNode.get(
            typeof link.source === "object"
              ? (link.source as NodeT).id
              : (link.source as string | number)
          );
          const b = idToNode.get(
            typeof link.target === "object"
              ? (link.target as NodeT).id
              : (link.target as string | number)
          );
          if (a && b) {
            a.neighbors?.add(b.id);
            b.neighbors?.add(a.id);
          }
        });

        setData({ nodes, links });
      })
      .catch((err) => {
        console.error("네트워크 데이터 로드 실패:", err);
        setData({ nodes: [], links: [] });
      });
  }, []);

  const graphData = useMemo(
    () => data ?? { nodes: [], links: [] },
    [data]
  );

  // Force 설정 (원본 그대로)
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return;

    const fg = fgRef.current;

    const linkForce = fg.d3Force("link") as any;
    if (linkForce) {
      linkForce.distance((link: LinkT) => {
        const w = link.weight ?? 1;
        return 27 + w * 25;
      });
    }

    const chargeForce = fg.d3Force("charge") as any;
    if (chargeForce) {
      chargeForce.strength(-120);
    }

    fg.d3Force(
      "x",
      d3
        .forceX<NodeT>(0)
        .strength((node) => {
          const deg = node.neighbors?.size ?? 0;
          if (deg <= 1) return 0.2;
          if (deg <= 3) return 0.08;
          return 0.02;
        })
    );

    fg.d3Force(
      "y",
      d3
        .forceY<NodeT>(0)
        .strength((node) => {
          const deg = node.neighbors?.size ?? 0;
          if (deg <= 1) return 0.2;
          if (deg <= 3) return 0.08;
          return 0.02;
        })
    );

    fg.d3ReheatSimulation();
  }, [graphData]);

  // 선택 노드 zoom (원본 그대로)
  useEffect(() => {
    if (!selectedNode || !fgRef.current || !data) return;

    const allNodes = data.nodes;

    const nodesToFit = allNodes.filter((n) => {
      const isTarget = n.id === selectedNode.id;
      const isNeighbor = selectedNode.neighbors?.has(n.id);
      const sameCommunity = n.community === selectedNode.community;
      return isTarget || (isNeighbor && sameCommunity);
    });

    if (!nodesToFit.length) return;

    fgRef.current.zoomToFit(
      600,
      90,
      (n: any) => nodesToFit.includes(n)
    );
  }, [selectedNode, data]);

  // 검색 기능 (원본 그대로)
  useGraphSearch({
    searchTerm,
    graphData,
    searchKey: "label",
    onMatch: (target) => {
      setSelectedNode(target as NodeT);

      if (!fgRef.current || !data) return;

      const neighbors = target.neighbors ?? new Set();

      const nodesToFit = data.nodes.filter((n) =>
        n.id === target.id || neighbors.has(n.id)
      );

      fgRef.current.zoomToFit(
        600,
        80,
        (n: any) => nodesToFit.includes(n)
      );
    },
    onNoResult,
  });

  // 전체 그래프 보기 (원본 그대로)
  useEffect(() => {
    if (!fgRef.current) return;

    setSelectedNode(null);

    const fg = fgRef.current;
    fg.centerAt(INITIAL_CENTER_X, INITIAL_CENTER_Y, 600);
    fg.zoom(INITIAL_ZOOM, 600);
  }, [resetViewFlag]);

  // 로딩 상태 (height만 dimensions 사용)
  if (!data) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: dimensions.height }}
      >
        <div className="text-white text-xl font-semibold">
          그래프 불러오는 중 · · ·
        </div>
      </div>
    );
  }

  const nodes = data.nodes;

  const getNodeFromEndpoint = (
    endpoint: string | number | NodeT
  ): NodeT | undefined => {
    if (typeof endpoint === "object") return endpoint as NodeT;
    return nodes.find((n) => n.id === endpoint);
  };

  // 렌더링 (딱 여기 width/height만 dimensions로 변경)
  return (
    <div className="w-full h-full flex justify-center mt-0">
      <div
        className="relative"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <ForceGraph2D<NodeT, LinkT>
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeId="id"
          nodeLabel={(node) => `${node.label} (${node.role ?? "-"})`}
          warmupTicks={70}
          cooldownTicks={300}
          onBackgroundClick={() => setSelectedNode(null)}
          linkColor={(link: LinkT) => {
            if (!selectedNode) return "rgba(255,255,255,0.25)";

            const { sameCommunity, isConnectedToSelected } = getLinkRelation(
              link,
              selectedNode,
              getNodeFromEndpoint
            );

            if (sameCommunity && isConnectedToSelected) {
              return "rgba(255,255,255,0.9)";
            }
            return "rgba(255,255,255,0.05)";
          }}
          linkWidth={(link: LinkT) => {
            const w = link.weight ?? 1;

            if (!selectedNode) {
              return 0.3 + w * 0.6;
            }

            const { sameCommunity, isConnectedToSelected } = getLinkRelation(
              link,
              selectedNode,
              getNodeFromEndpoint
            );

            if (sameCommunity && isConnectedToSelected) {
              return 0.6 + w * 0.5;
            }
            return 0.15;
          }}
          nodeCanvasObject={(rawNode, ctx, globalScale) => {
            const node = rawNode as NodeT & { x: number; y: number };
            const color = COLORS[(node.community ?? 0) % COLORS.length];

            const isMain =
              selectedNode != null && selectedNode.id == node.id;
            const isNeighbor =
              selectedNode != null &&
              selectedNode.neighbors?.has(node.id) === true;
            const sameCommunity =
              !selectedNode || node.community === selectedNode.community;

            // 선택 노드 배경 원
            if (isMain) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(255,255,255,0.25)";
              ctx.fill();
            }

            // 흐림 정도
            let opacity = 1;
            if (selectedNode) {
              if (!sameCommunity) {
                opacity = 0.08;
              } else if (isMain || isNeighbor) {
                opacity = 1;
              } else {
                opacity = 0.55;
              }
            }

            // 노드 그리기
            ctx.beginPath();
            ctx.globalAlpha = opacity;
            ctx.arc(
              node.x,
              node.y,
              isMain ? 8 : isNeighbor ? 6 : 4,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = color;
            ctx.fill();
            ctx.globalAlpha = 1;

            // 이름 표시 (원본 로직 그대로)
            if (selectedNode) {
              const showLabel = isMain || (isNeighbor && sameCommunity);

              if (showLabel) {
                const fontSize = 12 / (globalScale * 0.9);
                drawLabel(ctx, node.label, node.x, node.y, fontSize);
              }
            } else if (globalScale > 1.8) {
              const fontSize = 12 / globalScale;
              drawLabel(ctx, node.label, node.x, node.y, fontSize);
            }
          }}
          onNodeClick={(node) => focusNode(node as NodeT)}
          enableNodeDrag
        />
      </div>
    </div>
  );
}
