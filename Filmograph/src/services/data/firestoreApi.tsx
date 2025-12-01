import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import type { GraphData, Node, Link } from "../../types/data";

/* 메인 그래프에 필요한 노드 & 링크 데이터 가져옴
  @returns {Promise<GraphData>} 그래프 데이터
*/
const getMovieData = async (): Promise<GraphData> => {
  // (지금은 DB가 비어있지만) 나중에 채워질 데이터를 불러오는 함수
  const moviesSnap = await getDocs(collection(db, "movies"));
  const personsSnap = await getDocs(collection(db, "persons"));
  const rolesSnap = await getDocs(collection(db, "roles"));

  const nodes: Node[] = [
    ...moviesSnap.docs.map((d) => ({ ...(d.data() as Node), id: d.id })),
    ...personsSnap.docs.map((d) => ({ ...(d.data() as Node), id: d.id })),
  ];

  const links: Link[] = rolesSnap.docs.map((d) => d.data() as Link);

  return { nodes, links };
};

export default getMovieData;
