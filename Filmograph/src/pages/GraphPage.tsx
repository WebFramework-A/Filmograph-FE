import { useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import getGraphData from "../services/firestoreApi";
import type { GraphData } from "../types/data";

const GraphPage = () => {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] }); // 그래프 데이터 넣어줄 state
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리하는 state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const graphData = await getGraphData();

        setData(graphData);
      } catch (error) {
        console.error("그래프 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); //초기 마운트시에만 실행

  // 로딩중일때만 보여줄 UI
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        그래프 데이터를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D graphData={data} />
    </div>
  );
};

export default GraphPage;
