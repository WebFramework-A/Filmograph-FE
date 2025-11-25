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

// Props 타입 정의 (CollabNetworkGraph와 동일)
type BipartiteGraphProps = {
    resetViewFlag: boolean;
};

const MOVIE_COLOR = "#FF5252";
const ACTOR_COLOR = "#5B8FF9";
const DIRECTOR_COLOR = "#F6BD16";
const ACTOR_DIRECTOR_COLOR = "#E040FB";

const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 600;

function normalizeWeight(w: number, minW: number, maxW: number): number {
    if (minW === maxW) return 0.5;
    return (w - minW) / (maxW - minW);
}

const getNodeBaseSize = (node: NodeT, minVal: number, maxVal: number) => {
    const norm = normalizeWeight(node.val ?? 1, minVal, maxVal);
    return 10 + norm * 10;
}

// props로 resetViewFlag를 받음
export default function BipartiteGraph({ resetViewFlag }: BipartiteGraphProps) {
    const [data, setData] = useState<GraphT | null>(null);
    const fgRef = useRef<any>(null);

    // 데이터 로딩
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
                            }
                            else {
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
                            }
                            else {
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
                //중간 위로 올리기
                fgRef.current.centerAt(0, 1500, 0)
                //줌 (배율, 걸리는 시간)
                fgRef.current.zoom(0.04, 0)

            }, 200);
        }
    }, [graphData]);

    // resetViewFlag가 바뀔 때마다 전체 보기 실행
    useEffect(() => {
        if (!fgRef.current) return;
        fgRef.current.centerAt(0, 1500, 0)
        fgRef.current.zoom(0.04, 0)
    }, [resetViewFlag]);


    if (!data) return <div className="flex items-center justify-center text-white">그래프 불러오는 중· · ·</div>;

    return (
        <div className="w-full h-full flex flex-col items-center">
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

                d3Force={(name: string, force: any) => {
                    if (name === "charge") {
                        force.strength(-10);
                        force.distanceMax(200);
                    }
                    if (name === "link") {
                        force.distance(20);
                        force.strength(1);
                        force.iterations(10);
                    }
                    if (name === "collide") {
                        force.radius((node: any) => {
                            const baseSize = getNodeBaseSize(node, minVal, maxVal);
                            const buffer = node.type === 'movie' ? baseSize * 1.5 : baseSize;
                            return buffer + 2;
                        });
                        force.strength(0.8);
                    }
                    /*
                    //센터 위로
                    if (name === "center") {
                        force.y(-2000); // 노드들이 y=-150 좌표(위쪽)로 모이려고 함
                    }
                    */
                }}

                nodeCanvasObject={(rawNode, ctx, globalScale) => {
                    const node = rawNode as NodeT;
                    if (node.x === undefined || node.y === undefined) return;

                    const baseSize = getNodeBaseSize(node, minVal, maxVal);
                    const scaleAdjustment = globalScale > 1 ? Math.sqrt(globalScale) : 1;
                    const size = baseSize / scaleAdjustment;

                    let color = ACTOR_DIRECTOR_COLOR;

                    // 영화 노드 설정
                    if (node.type === "movie") {
                        color = MOVIE_COLOR;
                        ctx.fillStyle = color;

                        /* 네모로 그리기 */
                        // const rectWidth = size * 2.2;
                        // const rectHeight = size * 1.4;
                        // ctx.fillRect(
                        //   node.x - rectWidth / 2,
                        //   node.y - rectHeight / 2,
                        //   rectWidth,
                        //   rectHeight
                        // );

                        // 원형으로 그리기
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }

                    // 영화인 노드 설정
                    else {
                        if (node.role === "director") color = DIRECTOR_COLOR;
                        else if (node.role === "actor") color = ACTOR_COLOR;

                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }

                    if (globalScale > 1.5) {
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";

                        ctx.fillText(node.name, node.x, node.y);
                    }
                }}

                onNodeClick={(node) => {
                    fgRef.current?.centerAt(node.x, node.y, 500);
                    fgRef.current?.zoom(4, 500);
                }}

                onBackgroundClick={() => {
                    //배율 조정
                    fgRef.current.centerAt(0, 1500, 0)
                    fgRef.current.zoom(0.04, 0)
                }}
            />
        </div>
    );
}