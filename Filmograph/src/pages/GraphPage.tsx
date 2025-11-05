// src/pages/GraphPage.tsx (수정된 최종 버전)

import React, { useState, useEffect } from 'react'; // 1. React 훅 임포트
import ForceGraph2D from "react-force-graph-2d";
import { getGraphData } from '../services/firestoreApi'; // 2. 우리가 만든 Firebase API 헬퍼 임포트
import type { GraphData } from '../types/data'; // 3. 우리가 만든 타입 임포트

// 4. 기존에 있던 하드코딩된 const data = {...} 부분은 삭제합니다.

export default function GraphPage() {
  // 5. 데이터를 담을 state와 로딩 상태를 관리할 state를 생성합니다.
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true); // 처음엔 로딩 중 상태

  // 6. 컴포넌트가 처음 렌더링될 때 Firebase에서 데이터를 가져옵니다.
  useEffect(() => {
    // 비동기(async)로 데이터를 가져오는 함수를 정의합니다.
    const fetchData = async () => {
      try {
        setIsLoading(true); // 로딩 시작
        
        // 7. firestoreApi.ts의 getGraphData 함수를 호출해 DB 데이터를 가져옵니다!
        const graphData = await getGraphData(); 
        
        // 8. 성공적으로 가져온 데이터를 state에 저장합니다.
        setData(graphData); 
      } catch (error) {
        console.error("그래프 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false); // 로딩 끝 (성공하든 실패하든)
      }
    };

    fetchData(); // 정의한 함수를 실행합니다.
  }, []); // [] 비어있는 배열은 "처음 한 번만 실행"하라는 의미입니다.

  // 9. 로딩 중일 때(isLoading이 true일 때) 보여줄 화면입니다.
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>그래프 데이터를 불러오는 중입니다...</div>;
  }

  // 10. 로딩이 완료되면, DB에서 가져온 data를 사용해 그래프를 그립니다.
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D graphData={data} />
    </div>
  );
}