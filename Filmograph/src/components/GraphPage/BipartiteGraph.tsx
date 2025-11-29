import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { db } from "../../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useGraphSearch from "../../hooks/useGraphSearch";

import type { Node as CommonNode, Link as CommonLink } from "../../types/data";

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

// Props 타입 정의
type BipartiteGraphProps = {
    resetViewFlag: boolean;
    searchTerm?: string; // 🔥 추가
    onNoResult?: () => void;
};

// 노드 색깔 설정
const MOVIE_COLOR = "#FF5252";
const ACTOR_COLOR = "#5B8FF9";
const DIRECTOR_COLOR = "#F6BD16";
const ACTOR_DIRECTOR_COLOR = "#E040FB";

/*
const GRAPH_WIDTH = 2000;
const GRAPH_HEIGHT = 550;
*/

// 가중치 정규화
function normalizeWeight(w: number, minW: number, maxW: number): number {
    if (minW === maxW) return 0.5;
    return (w - minW) / (maxW - minW);
}

// 노드 크기 계산
const getNodeBaseSize = (node: NodeT, minVal: number, maxVal: number) => {
    const norm = normalizeWeight(node.val ?? 1, minVal, maxVal);
    return 10 + norm * 10;
};

// 캔버스 텍스트 줄바꿈 계산 함수
function getWrappedLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

export default function BipartiteGraph({
    resetViewFlag,
    searchTerm,
    onNoResult,
}: BipartiteGraphProps) {
    const [data, setData] = useState<GraphT | null>(null);

    // 하이라이팅을 위한 State
    const [hoverNode, setHoverNode] = useState<NodeT | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeT | null>(null);

    const fgRef = useRef<any>(null);

    // 더블 클릭 감지를 위한 마지막 클릭 시간 저장소
    const lastClickTimeRef = useRef<number>(0);
    // 페이지 이동 함수
    const navigate = useNavigate();

    //그래프 크기 관련 함수
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
    });

    useEffect(() => {
        const updateDimensions = () => {
            // 상단 헤더 + 검색바의 대략적인 높이 (스크린샷 기준 약 250px ~ 300px 예상)
            // 이 값을 조절하여 시작 위치를 맞출 수 있습니다.
            const TOP_OFFSET = 250;

            // 전체 높이에서 상단 영역을 뺀 '남은 공간'을 계산
            const availableHeight = window.innerHeight - TOP_OFFSET;

            setDimensions({
                width: window.innerWidth * 0.9,
                // 남은 공간의 97%만 차지하도록 설정 (음수 방지해주려고 Math.max()씀, 하단에 마진 조금 주려고 97%로 함)
                height: Math.max(availableHeight * 0.97, 400),
            });
        };

        window.addEventListener("resize", updateDimensions);
        updateDimensions(); // 초기 실행

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

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
                            } else {
                                const node = nodesMap.get(personId)!;
                                node.val = (node.val || 1) + 0.5;
                                if (node.role === "director") node.role = "actor/director";
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
                                if (node.role === "actor") node.role = "actor/director";
                            }
                            links.push({ source: movieId, target: personId });
                        });
                    }
                });

                setData({
                    nodes: Array.from(nodesMap.values()),
                    links,
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

    useGraphSearch({
        searchTerm: searchTerm ?? "",
        graphData,
        searchKey: "name",
        onMatch: (target) => {
            setSelectedNode(target as NodeT);

            const related = new Set([target.id]);

            graphData.links.forEach((link: any) => {
                const s =
                    typeof link.source === "object" ? link.source.id : link.source;
                const t =
                    typeof link.target === "object" ? link.target.id : link.target;

                if (s === target.id) related.add(t);
                if (t === target.id) related.add(s);
            });

            fgRef.current?.zoomToFit(600, 10, (n: any) => related.has(n.id));
        },
        onNoResult: () => onNoResult?.(),
    });

    // 하이라이팅 대상 계산
    const { highlightNodes, highlightLinks } = useMemo(() => {
        const targetNode = hoverNode || selectedNode;
        const hNodes = new Set<string>();
        const hLinks = new Set<CommonLink>();

        if (targetNode) {
            hNodes.add(targetNode.id);
            graphData.links.forEach((link: any) => {
                const sourceId =
                    typeof link.source === "object" ? link.source.id : link.source;
                const targetId =
                    typeof link.target === "object" ? link.target.id : link.target;

                if (sourceId === targetNode.id) {
                    hNodes.add(targetId);
                    hLinks.add(link);
                } else if (targetId === targetNode.id) {
                    hNodes.add(sourceId);
                    hLinks.add(link);
                }
            });
        }
        return { highlightNodes: hNodes, highlightLinks: hLinks };
    }, [hoverNode, selectedNode, graphData]);

    useEffect(() => {
        if (!fgRef.current) return;

        // Charge (전하량)
        fgRef.current.d3Force('charge')?.strength(-500).distanceMax(700);

        // Link (링크 장력)
        fgRef.current.d3Force('link')?.distance(50).strength(1).iterations(5);

        // Collide (충돌 방지)
        const collideForce = fgRef.current.d3Force('collide');
        if (collideForce) {
            collideForce.strength(1);
            collideForce.iterations(3); //반복 횟수 - 정확도 향상
            collideForce.radius((node: any) => {
                const baseSize = getNodeBaseSize(node, minVal, maxVal);
                const buffer = node.type === 'movie' ? baseSize * 1.5 : baseSize;
                return buffer + 10;
            });
        }
    }, [graphData, minVal, maxVal]); // 데이터나 범위가 바뀔 때 물리 엔진 재설정

    // 그래프 초기 로드 시 줌 맞춤
    useEffect(() => {
        if (fgRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
                fgRef.current.centerAt(0, 0, 0);
                fgRef.current.zoom(0.06, 0);
            }, 200);
        }
    }, [graphData]);

    // resetViewFlag가 바뀔 때마다 전체 보기 실행
    useEffect(() => {
        if (!fgRef.current) return;
        setSelectedNode(null);
        setHoverNode(null);
        fgRef.current.centerAt(0, 0, 100);
        fgRef.current.zoom(0.06, 0);
    }, [resetViewFlag]);

    if (!data) {
        return (
            <div
                className="w-full flex items-center justify-center"
                style={{ height: "550px" }}
            >
                <div className="text-white text-xl font-semibold">
                    그래프 불러오는 중 · · ·
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center"
        >
            <ForceGraph2D
                ref={fgRef}
                /* 
                        width={GRAPH_WIDTH}
                        height={GRAPH_HEIGHT}
                        */
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="transparent"
                graphData={graphData}
                nodeId="id"
                nodeLabel="name"
                enableNodeDrag={true}
                warmupTicks={100}
                cooldownTicks={200}
                // 링크 설정
                linkColor={(link: any) => {
                    if (highlightNodes.size > 0) {
                        return highlightLinks.has(link)
                            ? "rgba(255,255,255,0.9)" // 하이라이트된 링크
                            : "rgba(255,255,255,0.05)"; // 그 외 링크는 아주 흐리게
                    }
                    return "rgba(255,255,255,0.3)"; // 기본 상태
                }}
                linkWidth={(link: any) => (highlightLinks.has(link) ? 2 : 0.5)}
                // 노드 호버 이벤트
                onNodeHover={(node: any) => {
                    setHoverNode(node || null);
                }}
                onNodeClick={(node: any) => {
                    const now = Date.now();

                    //더블 클릭 감지
                    if (now - lastClickTimeRef.current < 300) {
                        if (node.type === "movie") {
                            navigate(`/detail/${node.id}`);
                        }
                    } else {
                        setSelectedNode(node);
                        // 클릭한 노드와 연결된 이웃 노드들의 ID 찾기
                        const relatedNodeIds = new Set([node.id]);

                        graphData.links.forEach((link: any) => {
                            // link.source/target이 객체일 수도, ID일 수도 있어서 안전하게 처리
                            const sId =
                                typeof link.source === "object" ? link.source.id : link.source;
                            const tId =
                                typeof link.target === "object" ? link.target.id : link.target;

                            if (sId === node.id) relatedNodeIds.add(tId);
                            if (tId === node.id) relatedNodeIds.add(sId);
                        });

                        // 해당 노드들의 범위에 맞춰서 줌 (zoomToFit)
                        // zoomToFit(duration, padding, filterFunction)
                        fgRef.current?.zoomToFit(
                            500, // 애니메이션 시간
                            10, // 화면 가장자리 여백 px
                            (n: any) => relatedNodeIds.has(n.id) // 이 함수가 true인 노드들만 화면에 담음
                        );
                    }
                    // 마지막 클릭 시간 갱신
                    lastClickTimeRef.current = now;
                }}
                //그래프 배경 클릭시
                onBackgroundClick={() => {
                    setSelectedNode(null);
                    setHoverNode(null);
                    /* 전체 그래프 보기 버튼 따로 만들었으니 삭제
                              fgRef.current.centerAt(0, 150, 0)
                              fgRef.current.zoom(0.06, 0)
                              */
                }}
                nodeCanvasObject={(rawNode, ctx, globalScale) => {
                    const node = rawNode as NodeT;
                    if (node.x === undefined || node.y === undefined) return;

                    const baseSize = getNodeBaseSize(node, minVal, maxVal);
                    const scaleAdjustment = globalScale > 1 ? Math.sqrt(globalScale) : 1;
                    const size = baseSize / scaleAdjustment;

                    // 하이라이팅: 활성화된 하이라이트가 있는데, 현재 노드가 거기에 포함 안되면 투명도 낮춤
                    const isHighlighted = highlightNodes.has(node.id);
                    const hasActiveHighlight = highlightNodes.size > 0;

                    if (hasActiveHighlight && !isHighlighted) {
                        ctx.globalAlpha = 0.1; // 흐리게 처리
                    } else {
                        ctx.globalAlpha = 1; // 정상 출력
                    }

                    let color = ACTOR_DIRECTOR_COLOR;

                    // 영화 노드 설정
                    if (node.type === "movie") {
                        color = MOVIE_COLOR;
                        ctx.fillStyle = color;
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

                    // 하이라이트 상태면 텍스트도 보여주거나, 일정 이상 확대되었을 때 보여줌
                    const showLabel = globalScale > 1.0 || isHighlighted;

                    if (showLabel) {
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        // 줄바꿈 로직 적용
                        // 화면 확대/축소 비율에 맞춰 폭 조절
                        const maxWidth = 120 / globalScale;

                        // 헬퍼 함수로 줄바꿈된 텍스트 배열 가져오기
                        const lines = getWrappedLines(ctx, node.name, maxWidth);

                        // 줄 간격 (폰트 크기의 1.2배)
                        const lineHeight = fontSize * 1.2;

                        // 여러 줄 그리기
                        lines.forEach((line, i) => {
                            // 텍스트 블록 전체를 수직 중앙 정렬하기 위한 Y 좌표 계산
                            // (i - (전체줄수 - 1) / 2) 공식을 사용하여 중앙 기준 위아래로 펼침
                            const dy = (i - (lines.length - 1) / 2) * lineHeight;

                            // node.y 위치를 기준으로 dy만큼 이동하여 그리기
                            if (node.x !== undefined && node.y !== undefined) {
                                ctx.fillText(line, node.x, node.y + dy);
                            }
                        });
                    }

                    // 캔버스 설정 복구
                    ctx.globalAlpha = 1;
                }}
            />
        </div>
    );
}
