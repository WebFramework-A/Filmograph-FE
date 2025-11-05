// src/services/firestoreApi.ts
import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { GraphData, Node, Link } from '../types/data';

/**
 * 메인 그래프에 필요한 모든 노드와 링크 데이터를 가져옵니다.
 * @returns {Promise<GraphData>} 그래프 데이터
 */
export const getGraphData = async (): Promise<GraphData> => {
  // (지금은 DB가 비어있지만) 나중에 채워질 데이터를 불러오는 함수
  const moviesSnap = await getDocs(collection(db, 'movies'));
  const personsSnap = await getDocs(collection(db, 'persons'));
  const rolesSnap = await getDocs(collection(db, 'roles'));

  const nodes: Node[] = [
    ...moviesSnap.docs.map(d => ({ ...(d.data() as Node), id: d.id })),
    ...personsSnap.docs.map(d => ({ ...(d.data() as Node), id: d.id })),
  ];

  const links: Link[] = rolesSnap.docs.map(d => (d.data() as Link));

  return { nodes, links };
};

/**
 * (예시) 특정 영화의 상세 정보를 가져옵니다.
 */
export const getMovieDetail = async (id: string) => {
  const docRef = doc(db, 'movies', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};