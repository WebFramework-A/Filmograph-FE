import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { db } from "../../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import type {
    Node as CommonNode,
    Link as CommonLink,
} from "../../types/data";

type NodeT = CommonNode & {
    role?: string;
    x?: number;
    y?: number;
};

type LinkT = CommonLink;

type GraphT = {
    nodes: NodeT[];
    links: LinkT[];
};


const ACTOR_COLOR = "#4FC3F7";
const DIRECTOR_COLOR = "#FFD700";
const MOVIE_COLOR = "#FF6B6B";
const ACTOR_DIRECTOR_COLOR = "#A7CD7B";

const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 600;

function normalizeWeight(w: number, minW: number, maxW: number): number {
    if (minW === maxW) return 0.5;
    return (w - minW) / (maxW - minW);
}

const getNodeBaseSize = (node: NodeT, minVal: number, maxVal: number) => {
    const norm = normalizeWeight(node.val ?? 1, minVal, maxVal);
    // 이 부분은 노드 크기를 키운 버전으로 유지했습니다.
    return 10 + norm * 10;
}

export default function BipartiteGraph() {
    const [data, setData] = useState<GraphT | null>(null);
    const fgRef = useRef<any>(null);

    // 1. 데이터 로딩
    useEffect(() => {
        async function fetchBipartiteData() {
            try {
                const moviesSnap = await getDocs(collection(db, "movies"));
                const nodesMap = new Map<string, NodeT>();
                const links: LinkT[] = [];

                moviesSnap.forEach((doc) => {
                    const data = doc.data();
                    const movieId = doc.id;
                    const movieTitle = data.title || "제목 없음";

                    if (!nodesMap.has(movieId)) {
                        nodesMap.set(movieId, {
                            id: movieId,
                            name: movieTitle,
                            type: "movie",
                            val: 3,
                        });
                    }

                    if (data.cast && Array.isArray(data.cast)) {
                        data.cast.forEach((person: any) => {
                            const personId = person.name;
                            if (!nodesMap.has(personId)) {
                                nodesMap.set(personId, {
                                    id: personId,
                                    name: person.name,
                                    type: "person",
                                    role: "actor",
                                    val: 1,
                                });
                            } else {
                                const node = nodesMap.get(personId)!;
                                node.val = (node.val || 1) + 0.5;
                                if (node.role === 'director') node.role = 'actor/director';
                            }
                            links.push({ source: movieId, target: personId });
                        });
                    }

                    if (data.directors && Array.isArray(data.directors)) {
                        data.directors.forEach((person: any) => {
                            const personId = person.name;
                            if (!nodesMap.has(personId)) {
                                nodesMap.set(personId, {
                                    id: personId,
                                    name: person.name,
                                    type: "person",
                                    role: "director",
                                    val: 1,
                                });
                            } else {
                                const node = nodesMap.get(personId)!;
                                node.val = (node.val || 1) + 0.5;
                                if (node.role === 'actor') node.role = 'actor/director';
                            }
                            links.push({ source: movieId, target: personId });
                        });
                    }
                });

                setData({
                    nodes: Array.from(nodesMap.values()),
                    links
                });
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            }
        }
        fetchBipartiteData();
    }, []);

    const { minVal, maxVal } = useMemo(() => {
        if (!data) return { minVal: 1, maxVal: 1 };
        const vals = data.nodes.map((n) => n.val ?? 1);
        return {
            minVal: Math.min(...vals),
            maxVal: Math.max(...vals),
        };
    }, [data]);

    const graphData = useMemo(() => data ?? { nodes: [], links: [] }, [data]);

    // 그래프 초기 로드 시 줌 맞춤
    useEffect(() => {
        if (fgRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
                fgRef.current.zoomToFit(400, 50);
            }, 500);
        }
    }, [graphData]);


    if (!data) return <div className="text-white">Loading...</div>;

    return (
        <div className="w-full h-full flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">
                영화 - 영화인 관계도 (Bipartite Graph)
            </h2>

            <ForceGraph2D
                ref={fgRef}
                width={GRAPH_WIDTH}
                height={GRAPH_HEIGHT}
                backgroundColor="transparent"
                graphData={graphData}
                nodeId="id"
                nodeLabel="name"
                enableNodeDrag={true}
                warmupTicks={100}
                cooldownTicks={200}
                linkColor={() => "rgba(255,255,255,0.3)"}
                linkWidth={0.5}

                // [복원된 부분] d3Force prop 사용
                d3Force={(name: string, force: any) => {
                    if (name === "charge") {
                        force.strength(-10);
                        force.distanceMax(200); // 200이 아닌 10으로 되어있던 것도 오류 원인일 수 있습니다.
                    }
                    if (name === "link") {
                        force.distance(20);
                        force.strength(1);
                        force.iterations(10); // 링크 팽팽하게 하는 코드 추가
                    }
                    if (name === "collide") {
                        force.radius((node: any) => {
                            const baseSize = getNodeBaseSize(node, minVal, maxVal);
                            const buffer = node.type === 'movie' ? baseSize * 1.5 : baseSize;
                            return buffer + 2;
                        });
                        force.strength(0.8);
                    }
                }}

                // 노드 그리기
                nodeCanvasObject={(rawNode, ctx, globalScale) => {
                    const node = rawNode as NodeT;
                    if (node.x === undefined || node.y === undefined) return;

                    const baseSize = getNodeBaseSize(node, minVal, maxVal);
                    const scaleAdjustment = globalScale > 1 ? Math.sqrt(globalScale) : 1;
                    const size = baseSize / scaleAdjustment;

                    let color = ACTOR_DIRECTOR_COLOR;

                    if (node.type === "movie") {
                        color = MOVIE_COLOR;
                        ctx.fillStyle = color;

                        /* 네모로 그리기
                        const rectWidth = size * 2.2;
                        const rectHeight = size * 1.4;
                        ctx.fillRect(
                            node.x - rectWidth / 2,
                            node.y - rectHeight / 2,
                            rectWidth,
                            rectHeight
                        );
                        */
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }
                    else {
                        if (node.role === "director") color = DIRECTOR_COLOR;
                        else if (node.role === "actor") color = ACTOR_COLOR;

                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }

                    // 텍스트 라벨 (시맨틱 줌)
                    if (globalScale > 1.5) {
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";

                        // 텍스트 위치
                        ctx.fillText(node.name, node.x, node.y);
                    }
                }}

                onNodeClick={(node) => {
                    fgRef.current?.centerAt(node.x, node.y, 500);
                    fgRef.current?.zoom(4, 500);
                }}

                onBackgroundClick={() => {
                    fgRef.current?.zoomToFit(800, 150);
                }}
            />
        </div>
    );
}