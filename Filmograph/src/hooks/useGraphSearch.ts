// src/hooks/useGraphSearch.ts
import { useEffect } from "react";

// 공통 노드 타입
export interface SearchNode {
  id: string | number;
  [key: string]: any;  // name, label 등 어떤 속성이든 허용
}

// 공통 그래프 타입
export interface SearchGraphData {
  nodes: SearchNode[];
  links: any[];
}

interface UseGraphSearchProps {
  searchTerm: string;
  graphData: SearchGraphData;
  searchKey: string;               // 검색할 노드 속성 키
  onMatch: (node: SearchNode) => void;
  onNoResult: () => void;
}

// 공통 검색 
export default function useGraphSearch({
  searchTerm,
  graphData,
  searchKey,
  onMatch,
  onNoResult,
}: UseGraphSearchProps) {
  useEffect(() => {
    const keyword = searchTerm.trim();
    if (!keyword) return;

    const lower = keyword.toLowerCase();

    // 공통 검색 로직
    const target = graphData.nodes.find((n: SearchNode) =>
      ((n[searchKey] ?? "") as string).toLowerCase().includes(lower)
    );

    if (!target) {
      onNoResult();
      return;
    }

    onMatch(target);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, graphData]);
}
