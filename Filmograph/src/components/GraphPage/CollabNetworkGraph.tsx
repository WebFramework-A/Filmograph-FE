// src/components/GraphPage/CollabNetworkGraph.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";
import * as d3 from "d3-force";
import useGraphSearch from "../../hooks/useGraphSearch";
import type { GraphCollabT, LinkCollabT, NodeCollabT } from "../../types/graph";

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

// 카메라 초기값
const INITIAL_CENTER_X = 0;
const INITIAL_CENTER_Y = 0;
const INITIAL_ZOOM = 0.94;

// 링크 관계 계산
const getLinkRelation = (
  link: LinkCollabT,
  selectedNode: NodeCollabT | null,
  getNode: (endpoint: string | number | NodeCollabT) => NodeCollabT | undefined
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

export default function CollabNetworkGraph({
  resetViewFlag,
  searchTerm,
  onNoResult,
}: CollabNetworkGraphProps) {
  const [data, setData] = useState<GraphCollabT | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeCollabT | null>(null);

  const fgRef = useRef<ForceGraphMethods<NodeCollabT, LinkCollabT> | undefined>(
    undefined
  );

  // 화면 크기 기반
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: Math.max(window.innerHeight * 0.7, 400),
  });

  useEffect(() => {
    const updateSize = () => {
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

  // JSON 로드
  useEffect(() => {
    fetch("/graph/network_data.json")
      .then((res) => res.json())
      .then((json: GraphCollabT) => {
        const { nodes, links } = json;
        const idToNode = new Map<string | number, NodeCollabT>();

        nodes.forEach((node) => {
          node.neighbors = new Set();
          idToNode.set(node.id, node);
          node.y = (node.y ?? 0) - 200;
        });

        links.forEach((link) => {
          const a = idToNode.get(
            typeof link.source === "object"
              ? (link.source as NodeCollabT).id
              : link.source
          );
          const b = idToNode.get(
            typeof link.target === "object"
              ? (link.target as NodeCollabT).id
              : link.target
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

  const graphData = useMemo(() => data ?? { nodes: [], links: [] }, [data]);

  // 포스 설정
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return;

    const fg = fgRef.current;

    const linkForce = fg.d3Force("link") as any;
    if (linkForce) {
      linkForce.distance((link: LinkCollabT) => {
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
      d3.forceX<NodeCollabT>(0).strength((node) => {
        const deg = node.neighbors?.size ?? 0;
        if (deg <= 1) return 0.2;
        if (deg <= 3) return 0.08;
        return 0.02;
      })
    );

    fg.d3Force(
      "y",
      d3.forceY<NodeCollabT>(0).strength((node) => {
        const deg = node.neighbors?.size ?? 0;
        if (deg <= 1) return 0.2;
        if (deg <= 3) return 0.08;
        return 0.02;
      })
    );

    fg.d3ReheatSimulation();
  }, [graphData]);

  // 선택 노드 zoom
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

    fgRef.current.zoomToFit(600, 90, (n: any) => nodesToFit.includes(n));
  }, [selectedNode, data]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색 기능
  useGraphSearch({
    searchTerm: mounted ? searchTerm ?? "" : "",
    graphData,
    searchKey: "label",

    onMatch: (target) => {
      setSelectedNode(target as NodeCollabT);

      if (!fgRef.current || !data) return;

      const neighbors = target.neighbors ?? new Set();

      const nodesToFit = data.nodes.filter(
        (n) => n.id === target.id || neighbors.has(n.id)
      );

      fgRef.current.zoomToFit(600, 80, (n: any) => nodesToFit.includes(n));
    },
    onNoResult,
  });

  // 전체 그래프 보기
  useEffect(() => {
    if (!fgRef.current) return;

    setSelectedNode(null);

    const fg = fgRef.current;
    fg.centerAt(INITIAL_CENTER_X, INITIAL_CENTER_Y, 600);
    fg.zoom(INITIAL_ZOOM, 600);
  }, [resetViewFlag]);

  // 로딩 중
  if (!data) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b4747] z-50"
        style={{ height: dimensions.height }}
      >
        <div className="text-white text-xl font-semibold animate-pulse">
          그래프 불러오는 중 · · ·
        </div>
      </div>
    );
  }

  const nodes = data.nodes;

  const getNodeFromEndpoint = (
    endpoint: string | number | NodeCollabT
  ): NodeCollabT | undefined => {
    if (typeof endpoint === "object") return endpoint as NodeCollabT;
    return nodes.find((n) => n.id === endpoint);
  };

  return (
    <div className="w-full h-full flex justify-center mt-0">
      <div
        className="relative"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <ForceGraph2D<NodeCollabT, LinkCollabT>
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
          linkColor={(link: LinkCollabT) => {
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
          linkWidth={(link: LinkCollabT) => {
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
            const node = rawNode as NodeCollabT & { x: number; y: number };
            const color = COLORS[(node.community ?? 0) % COLORS.length];

            const isMain = selectedNode != null && selectedNode.id == node.id;
            const isNeighbor =
              selectedNode != null &&
              selectedNode.neighbors?.has(node.id) === true;
            const sameCommunity =
              !selectedNode || node.community === selectedNode.community;

            if (isMain) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(255,255,255,0.25)";
              ctx.fill();
            }

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
          onNodeClick={(node) => setSelectedNode(node as NodeCollabT)}
          enableNodeDrag
        />
      </div>
    </div>
  );
}
