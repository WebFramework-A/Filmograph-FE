// src/hooks/useGraphSearch.ts
import { useEffect } from "react";

interface SearchNode {
  id: string | number;
  [key: string]: any;
}

interface SearchGraphData {
  nodes: SearchNode[];
  links: any[];
}

interface UseGraphSearchProps {
  searchTerm: string;
  graphData: SearchGraphData;
  searchKey: string;
  onMatch: (node: SearchNode) => void;
  onNoResult?: () => void;   // optional
}

export default function useGraphSearch({
  searchTerm,
  graphData,
  searchKey,
  onMatch,
  onNoResult
}: UseGraphSearchProps) {

  useEffect(() => {
    const keyword = searchTerm.trim();

    // 검색어 없으면 실행 금지  
    if (!keyword) return;

    // 그래프 데이터가 아직 로드 안됐으면 금지
    if (!graphData.nodes.length) return;

    const lower = keyword.toLowerCase();

    const target = graphData.nodes.find((n: SearchNode) =>
      ((n[searchKey] ?? "") as string).toLowerCase().includes(lower)
    );

  if (!target) {
    if (onNoResult) {
      onNoResult(); }
    return;
  }

  onMatch(target);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, graphData]);
}
