import type { LinkObject, NodeObject } from "react-force-graph-2d";

// ====== 그래프 공통 타입 ======
export interface BaseNode {
  id: string | number;
  role?: string;
}

export interface BaseLink<N = BaseNode> {
  source: string | number | N;
  target: string | number | N;
}

export interface GraphData<N, L> {
  nodes: N[];
  links: L[];
}

// ====== 영화-영화인 그래프 (BipartiteGraph) 타입 ======
export interface BipartiteNode extends BaseNode, NodeObject {
  id: string;
  name: string;
  type: "movie" | "person";
  val: number; // 가중치 (출연작 수 등)
  releaseYear?: string;
  rating?: number;
}

export interface BipartiteLink
  extends BaseLink<BipartiteNode>,
    LinkObject<BipartiteNode> {
  source: string | BipartiteNode;
  target: string | BipartiteNode;
}

export type GraphT = GraphData<BipartiteNode, BipartiteLink>;

// 하위 호환성을 위한 별칭
export type Node = BipartiteNode;
export type NodeT = BipartiteNode;
export type Link = BipartiteLink;
export type LinkT = BipartiteLink;

// ====== 에고 그래프 (EgoGraph) 타입 ======
export interface EgoNode extends BaseNode, NodeObject {
  id: string | number;
  label: string;
  community?: number;
  degree?: number;
  movies_count?: number;
}

export interface EgoLink extends BaseLink<EgoNode>, LinkObject<EgoNode> {
  source: string | number | EgoNode;
  target: string | number | EgoNode;
  weight?: number;
}

export type GraphEgoT = GraphData<EgoNode, EgoLink>;

// 하위 호환성을 위한 별칭
export type NodeEgoT = EgoNode;
export type LinkEgoT = EgoLink;

// ====== 협업 네트워크 그래프 (CollabNetworkGraph) 타입 ======
export interface CollabNode extends BaseNode, NodeObject {
  id: string | number;
  label: string;
  community?: number;
  degree?: number;
  movies_count?: number;
  neighbors?: Set<string | number>;
}

export interface CollabLink
  extends BaseLink<CollabNode>,
    LinkObject<CollabNode> {
  source: string | number | CollabNode;
  target: string | number | CollabNode;
  weight?: number;
}

export type GraphCollabT = GraphData<CollabNode, CollabLink>;

// 하위 호환성을 위한 별칭
export type NodeCollabT = CollabNode;
export type LinkCollabT = CollabLink;
