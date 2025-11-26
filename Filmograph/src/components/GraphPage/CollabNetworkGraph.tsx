// src/components/GraphPage/CollabNetworkGraph.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";
import * as d3 from "d3-force";

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

const GRAPH_WIDTH = 2000;
const GRAPH_HEIGHT = 550;

// 카메라 위치
const INITIAL_CENTER_X = 0;
const INITIAL_CENTER_Y = -1; 
const INITIAL_ZOOM = 0.94;

// 함수
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

// 라벨 그리기
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
  resetViewFlag,
}: CollabNetworkGraphProps) {
  const [data, setData] = useState<GraphT | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeT | null>(null);
  const fgRef = useRef<ForceGraphMethods<NodeT, LinkT> | null>(null);

  // JSON 로드
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
          node.y = (node.y ?? 0) - 120;
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

  // Force 설정
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return;

    const fg = fgRef.current;

    const linkForce = fg.d3Force("link") as any;
    if (linkForce) {
      linkForce.distance((link: LinkT) => {
        const w = link.weight ?? 1;
        return 15 + w * 3;
      });
    }

    const chargeForce = fg.d3Force("charge") as any;
    if (chargeForce) {
      chargeForce.strength(-150);
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

  //  노드 클릭 시 포커싱
  useEffect(() => {
    if (!selectedNode || !fgRef.current) return;

    if (selectedNode.x != null && selectedNode.y != null) {
      fgRef.current.centerAt(selectedNode.x, selectedNode.y, 600);
      fgRef.current.zoom(1.5, 600);
    }
  }, [selectedNode]);

  // 전체 그래프 보기
  useEffect(() => {
    if (!fgRef.current) return;

    setSelectedNode(null);

    const fg = fgRef.current;
    fg.centerAt(INITIAL_CENTER_X, INITIAL_CENTER_Y, 600);
    fg.zoom(INITIAL_ZOOM, 600);
  }, [resetViewFlag]);

  // 로딩 상태
  if (!data) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: GRAPH_HEIGHT }}
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

  // 렌더링
  return (
    <div className="w-full h-full flex justify-center mt-0">
      <div
        className="relative"
        style={{ width: GRAPH_WIDTH, height: GRAPH_HEIGHT }}
      >
        <ForceGraph2D<NodeT, LinkT>
          ref={fgRef}
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
          graphData={graphData}
          backgroundColor="transparent"
          nodeId="id"
          nodeLabel={(node) => `${node.label} (${node.role ?? "-"})`}
          warmupTicks={70}
          cooldownTicks={300}
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

            // 이름 표시
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
          onNodeClick={(node) => setSelectedNode(node as NodeT)}
          enableNodeDrag
        />
      </div>
    </div>
  );
}
