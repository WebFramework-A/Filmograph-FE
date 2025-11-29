import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { db } from "../../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useGraphSearch from "../../hooks/useGraphSearch";

import type {
    Node as CommonNode,
    Link as CommonLink,
} from "../../types/data";

// 상세 정보
type NodeT = CommonNode & {
    role?: string;
    x?: number;
    y?: number;
    releaseYear?: string;
    rating?: number;
};

type LinkT = CommonLink;

type GraphT = {
    nodes: NodeT[];
    links: LinkT[];
};

// Props 타입 정의
type BipartiteGraphProps = {
    resetViewFlag: boolean;
    searchTerm?: string;
    onNoResult?: () => void;
};

// 노드 색깔 설정
const MOVIE_COLOR = "#FF5252";
const ACTOR_COLOR = "#5B8FF9";
const DIRECTOR_COLOR = "#F6BD16";
const ACTOR_DIRECTOR_COLOR = "#E040FB";

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

    // 그래프 렌더링 상태 관리 (로딩 화면용)
    const [isGraphReady, setIsGraphReady] = useState(false);

    const fgRef = useRef<any>(null);

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 그래프 크기 관련 함수
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 화면 크기 감지 (불필요한 updateDimensions 함수 제거)
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions({ width, height });
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 안전장치: 데이터 로드 후 5초가 지나도 그래프가 준비 안 되면 강제로 보여줌
    useEffect(() => {
        if (data && !isGraphReady) {
            const timer = setTimeout(() => setIsGraphReady(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [data, isGraphReady]);

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
                            // [추가] 상세 정보 매핑 (DB 필드명에 맞춰주세요)
                            releaseYear: data.releaseDate ? data.releaseDate.substring(0, 4) : "?",
                            rating: data.rating || 0,
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

    // 검색 로직
    useGraphSearch({
        searchTerm: searchTerm ?? "",
        graphData,
        searchKey: "name",
        onMatch: (target) => {
            setSelectedNode(target as NodeT);
            const related = new Set([target.id]);
            graphData.links.forEach((link: any) => {
                const s = typeof link.source === "object" ? link.source.id : link.source;
                const t = typeof link.target === "object" ? link.target.id : link.target;
                if (s === target.id) related.add(t);
                if (t === target.id) related.add(s);
            });
            fgRef.current?.zoomToFit(600, 10, (n: any) => related.has(n.id));
        },
        onNoResult: () => onNoResult?.()
    });

    // 하이라이팅 대상 계산
    const { highlightNodes, highlightLinks } = useMemo(() => {
        const targetNode = hoverNode || selectedNode;
        const hNodes = new Set<string>();
        const hLinks = new Set<CommonLink>();

        if (targetNode) {
            hNodes.add(targetNode.id);
            graphData.links.forEach((link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;

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

    // 물리 엔진 설정
    useEffect(() => {
        if (!fgRef.current) return;
        fgRef.current.d3Force('charge')?.strength(-500).distanceMax(700);
        fgRef.current.d3Force('link')?.distance(50).strength(1).iterations(5);

        const collideForce = fgRef.current.d3Force('collide');
        if (collideForce) {
            collideForce.strength(1);
            collideForce.iterations(3);
            collideForce.radius((node: any) => {
                const baseSize = getNodeBaseSize(node, minVal, maxVal);
                const buffer = node.type === 'movie' ? baseSize * 1.5 : baseSize;
                return buffer + 10;
            });
        }
    }, [graphData, minVal, maxVal]);

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
        fgRef.current.centerAt(0, 0, 500);
        fgRef.current.zoom(0.06, 500);
    }, [resetViewFlag]);

    return (
        <div ref={containerRef} className="w-full h-full relative flex flex-col items-center justify-center bg-[#0d5a5a]">

            {/* 로딩 오버레이 */}
            {(!data || !isGraphReady) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d5a5a] z-50">
                    <div className="text-white text-xl font-semibold animate-pulse">
                        그래프 불러오는 중...
                    </div>
                </div>
            )}

            {/* 그래프 컴포넌트 */}
            {data && dimensions.width > 0 && (
                <ForceGraph2D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="transparent"
                    graphData={graphData}
                    nodeId="id"
                    nodeLabel="name"
                    enableNodeDrag={false}
                    warmupTicks={100}
                    cooldownTicks={50}

                    // d3AlphaDecay를 Prop으로 전달
                    d3AlphaDecay={0.05}

                    onEngineStop={() => setIsGraphReady(true)}

                    // 링크 설정
                    linkColor={(link: any) => {
                        if (highlightNodes.size > 0) {
                            return highlightLinks.has(link)
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(255,255,255,0.05)";
                        }
                        return "rgba(255,255,255,0.3)";
                    }}

                    linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 0.5}

                    onNodeHover={(node: any) => {
                        const currentZoom = fgRef.current?.zoom();
                        const HOVER_THRESHOLD = 0.5;
                        if (currentZoom !== undefined && currentZoom < HOVER_THRESHOLD) {
                            setHoverNode(null);
                            return;
                        }
                        setHoverNode(node || null);
                    }}

                    // 클릭 시 노드 선택
                    onNodeClick={(node: any) => {
                        setSelectedNode(node);

                        const relatedNodeIds = new Set([node.id]);
                        graphData.links.forEach((link: any) => {
                            const sId = typeof link.source === 'object' ? link.source.id : link.source;
                            const tId = typeof link.target === 'object' ? link.target.id : link.target;
                            if (sId === node.id) relatedNodeIds.add(tId);
                            if (tId === node.id) relatedNodeIds.add(sId);
                        });

                        fgRef.current?.zoomToFit(
                            500, 100, (n: any) => relatedNodeIds.has(n.id)
                        );
                    }}

                    onBackgroundClick={() => {
                        setSelectedNode(null);
                        setHoverNode(null);
                    }}

                    nodeCanvasObject={(rawNode, ctx, globalScale) => {
                        const node = rawNode as NodeT;
                        if (node.x === undefined || node.y === undefined) return;

                        const baseSize = getNodeBaseSize(node, minVal, maxVal);
                        const scaleAdjustment = globalScale > 1 ? Math.sqrt(globalScale) : 1;
                        const size = baseSize / scaleAdjustment;

                        // 하이라이팅 로직
                        const isHighlighted = highlightNodes.has(node.id);
                        const hasActiveHighlight = highlightNodes.size > 0;

                        if (hasActiveHighlight && !isHighlighted) {
                            ctx.globalAlpha = 0.1; // 흐리게 처리
                        } else {
                            ctx.globalAlpha = 1;   // 정상 출력
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

                        const showLabel = globalScale > 1.0 || isHighlighted;

                        if (showLabel) {
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            const maxWidth = 120 / globalScale;
                            const lines = getWrappedLines(ctx, node.name, maxWidth);
                            const lineHeight = fontSize * 1.2;

                            lines.forEach((line, i) => {
                                const dy = (i - (lines.length - 1) / 2) * lineHeight;
                                if (node.x !== undefined && node.y !== undefined) {
                                    ctx.fillText(line, node.x, node.y + dy);
                                }
                            });
                        }

                        // 캔버스 설정 복구
                        ctx.globalAlpha = 1;
                    }}
                />
            )}

            {/* 노드 상세 정보 모달 (영화 노드일 때만 표시) */}
            {selectedNode && selectedNode.type === "movie" && (
                <div className="absolute top-4 right-4 w-72 bg-black/80 text-white p-5 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md z-50 animate-fade-in">

                    {/* 닫기 버튼 */}
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
                    >
                        ✕
                    </button>

                    {/* 제목 */}
                    <h3 className="text-xl font-bold mb-1 text-[#FFE66D]">
                        {selectedNode.name}
                    </h3>

                    {/* 타입 표시 */}
                    <p className="text-sm text-white/60 mb-4 capitalize">
                        영화 (Movie)
                    </p>

                    {/* 영화 상세 정보 */}
                    <div className="space-y-1 mb-4 text-sm text-white/80">
                        {/* 타입 단언을 사용하여 추가 필드 접근 */}
                        <p>개봉: {(selectedNode as any).releaseYear ?? "?"}</p>
                        <p>평점: {(selectedNode as any).rating.toFixed(1) ?? "N/A"}</p>
                    </div>

                    {/* 상세페이지 이동 버튼 */}
                    <button
                        onClick={() => {
                            navigate(`/detail/${selectedNode.id}`);
                        }}
                        className="w-full py-2 bg-[#FFE66D] hover:bg-[#FFF176] text-black rounded-lg font-bold transition-colors shadow-md"
                    >
                        상세페이지 보러가기 →
                    </button>
                </div>
            )}
        </div>
    );
}