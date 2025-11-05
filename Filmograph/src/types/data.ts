// src/types/data.ts
export interface Node {
  id: string;
  name: string;
  type: 'movie' | 'person';
  val: number; // 가중치 (출연작 수 등)
}

export interface Link {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}