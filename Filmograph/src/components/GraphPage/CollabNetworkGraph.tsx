// src/components/GraphPage/CollabNetworkGraph.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods, LinkObject,NodeObject } from "react-force-graph-2d";

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

// 색상
const COLORS = [
  "#5B8FF9",
  "#5AD8A6",
  "#F6BD16",
  "#E8684A",
  "#6F5EF9",
  "#52C41A",
  "#EB2F96",
];

// 크기
const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 550;

export default function CollabNetworkGraph() {
  const [data, setData] = useState<GraphT | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeT | null>(null);
  const fgRef = useRef<ForceGraphMethods | null>(null);


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
        });

        links.forEach((link) => {
          const a = idToNode.get(
            typeof link.source == "object"
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
      });
  }, []);

  const graphData = useMemo(() => data ?? { nodes: [], links: [] }, [data]);

  // 클릭 시 선택한 노드로 포커싱
  useEffect(() => {
    if (!selectedNode || !fgRef.current) return;

    if (selectedNode.x != null && selectedNode.y != null) {
      fgRef.current.centerAt(selectedNode.x, selectedNode.y, 600);
      fgRef.current.zoom(1.8, 600);
    }
  }, [selectedNode]);

  if (!data) {
    return <div className="p-4 text-sm text-white">그래프 불러오는 중...</div>;
  }

  // 노드 객체 가져오기
  const getNodeFromEndpoint = (
    endpoint: string | number | NodeT
  ): NodeT | undefined => {
    if (typeof endpoint == "object") {
      return endpoint as NodeT;
    }
    return data.nodes.find((n) => n.id === endpoint);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ForceGraph2D<NodeT, LinkT>
        ref={fgRef} // 아무리해도 빨간 줄이 안 없어짐.. 오류는 아니래..
        width={GRAPH_WIDTH}
        height={GRAPH_HEIGHT}
        graphData={graphData}
        backgroundColor="transparent"
        nodeId="id"
        nodeLabel={(node) =>
          `${node.label} (${node.role ?? "-"})`
        }
        
        // 기본 그래프 퍼짐 정도
        linkDistance={(link: LinkObject<NodeT>) => {
          const w = (link as LinkT).weight ?? 1;
          return 120 + w * 12;
        }}
        warmupTicks={70}
        cooldownTicks={300}
        // 선택 노드 + 같은 커뮤니티만
        linkColor={(link: LinkT) => {
          if (!selectedNode) return "rgba(255,255,255,0.25)";

          const src = getNodeFromEndpoint(link.source);
          const tgt = getNodeFromEndpoint(link.target);
          if (!src || !tgt) return "rgba(255,255,255,0.1)";

          const sameCommunity =
            src.community == selectedNode.community &&
            tgt.community == selectedNode.community;

          const isConnectedToSelected =
            src.id == selectedNode.id || tgt.id === selectedNode.id;

          if (sameCommunity && isConnectedToSelected) {
            // 선택한 노드, 같은 커뮤니티 이웃
            return "rgba(255,255,255,0.9)";
          }

          // 나머지는 거의 안 보이게
          return "rgba(255,255,255,0.05)";
        }}

        // 링크 두께: weight 값에 따라 두께를 다르게 표현
        linkWidth={(link: LinkT) => {
          const w = link.weight ?? 1;

          if (!selectedNode) {
            // 선택된 노드가 없으면 weight에 따라 두께 변화
            return 0.3 + w * 0.6;
          }

          const src = getNodeFromEndpoint(link.source);
          const tgt = getNodeFromEndpoint(link.target);
          if (!src || !tgt) return 0.1;

          const sameCommunity =
            src.community == selectedNode.community &&
            tgt.community == selectedNode.community;

          const isConnectedToSelected =
            src.id === selectedNode.id || tgt.id === selectedNode.id;

          if (sameCommunity && isConnectedToSelected) {
            // 하이라이트된 링크
            return 0.6 + w * 0.5;
          }

          // 흐려진 링크
          return 0.15;
        }}

        // 노드 그리기
        nodeCanvasObject={(rawNode, ctx, globalScale) => {
          const node = rawNode as NodeT & { x: number; y: number };

          const color = COLORS[(node.community ?? 0) % COLORS.length];

          const isMain = selectedNode != null && selectedNode.id === node.id;
          const isNeighbor =
            selectedNode != null &&
            selectedNode.neighbors?.has(node.id) === true;

          const sameCommunity =
            !selectedNode ||
            node.community == selectedNode.community;

          // 선택 노드
          if (isMain) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fill();
          }

          // 흐림 처리
          let opacity = 1;
          if (selectedNode) {
            if (!sameCommunity) {
              // 다른 커뮤니티는 거의 안 보이게
              opacity = 0.05;
            } else if (isMain || isNeighbor) {
              opacity = 1;
            } else {
              // 같은 커뮤니티지만 직접 연결은 아닌 노드
              opacity = 0.4;
            }
          }

          ctx.beginPath();
          ctx.globalAlpha = opacity;
          ctx.arc(node.x, node.y, isMain ? 8 : isNeighbor ? 6 : 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.globalAlpha = 1;

          // 라벨 표시
          // 아무도 선택 안 했으면 캔버스에 글자 안 그리기
          if (!selectedNode) return;

          // 선택한 노드도 아니고, 같은 커뮤니티의 이웃도 아니면 글자 안 그림
          if (!isMain && !(isNeighbor && sameCommunity)) return;

          const fontSize = (isMain ? 14 : 12) / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = "white";
          ctx.fillText(node.label, node.x + 12, node.y + 3);
        }}
        onNodeClick={(node) => setSelectedNode(node as NodeT)}
        enableNodeDrag
      />
    </div>
  );
}
