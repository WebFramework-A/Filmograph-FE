export type Node = {
  id: string;
  name: string;
  type: "movie" | "person";
  val: number; // 가중치 (출연작 수 등)
};

export type Link = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: Node[];
  links: Link[];
};
