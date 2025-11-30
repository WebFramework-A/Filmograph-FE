import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Network, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MovieDetail, Person } from "../../types/movie";

type NodeT = {
  id: string;
  name: string;
  type: "movie" | "actor" | "director";
  x: number;
  y: number;
  rating?: number;
  releaseYear?: string;
  character?: string;
};

type LinkT = { source: string; target: string };

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;

const R_CENTER = 0;        
const R_PEOPLE = 160;      
const R_RELATED = 250;     

// 소숫점 반올림
const round1 = (v?: number | null) =>
  typeof v === "number" ? Math.round(v * 10) / 10 : undefined;

export default function MovieGraphSection({
  movie,
  relatedMovies,
}: {
  movie: MovieDetail;
  relatedMovies: MovieDetail[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [nodes, setNodes] = useState<NodeT[]>([]);
  const [links, setLinks] = useState<LinkT[]>([]);
  const [hoveredNode, setHoveredNode] = useState<NodeT | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeT | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();

  const getMousePos = (e: MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    return {
      x: (canvasX - offset.x) / zoom,
      y: (canvasY - offset.y) / zoom,
    };
  };

  const applyZoom = (factor: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom * factor, 0.5), 3);

      const cx = (CANVAS_WIDTH / 2 - offset.x) / prevZoom;
      const cy = (CANVAS_HEIGHT / 2 - offset.y) / prevZoom;

      const newOffsetX = CANVAS_WIDTH / 2 - cx * newZoom;
      const newOffsetY = CANVAS_HEIGHT / 2 - cy * newZoom;

      setOffset({ x: newOffsetX, y: newOffsetY });
      return newZoom;
    });
  };

  const handleZoomIn = () => applyZoom(1.2);
  const handleZoomOut = () => applyZoom(0.83);

  useEffect(() => {
    if (!movie) return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    const nodeMap = new Map<string, NodeT>();
    const linkList: LinkT[] = [];

    // 중심 영화
    nodeMap.set(movie.id, {
      id: movie.id,
      name: movie.title,
      type: "movie",
      x: centerX,
      y: centerY,
      rating: round1(movie.rating),         
      releaseYear: movie.releaseDate?.slice(0, 4),
    });

    // 배우/감독 레이어
    const cast = (movie.cast ?? []).slice(0, 12);
    const directors = (movie.directors ?? []).slice(0, 6);
    const centerPeople: Person[] = [...cast, ...directors];

    centerPeople.forEach((p, idx) => {
      const pid = p.id ?? p.name;
      const angle = (Math.PI * 2 * idx) / centerPeople.length;

      nodeMap.set(pid, {
        id: pid,
        name: p.name,
        type: directors.includes(p) ? "director" : "actor",
        character: p.character,
        x: centerX + Math.cos(angle) * R_PEOPLE,
        y: centerY + Math.sin(angle) * R_PEOPLE,
      });

      linkList.push({ source: movie.id, target: pid });
    });

    // 관련 영화 레이어
    relatedMovies.slice(0, 8).forEach((r, idx) => {
      const angle = (Math.PI * 2 * idx) / 8;

      nodeMap.set(r.id, {
        id: r.id,
        name: r.title,
        type: "movie",
        x: centerX + Math.cos(angle) * R_RELATED,
        y: centerY + Math.sin(angle) * R_RELATED,
        rating: round1(r.rating),     
        releaseYear: r.releaseDate?.slice(0, 4),
      });

      const people = [...(r.cast ?? []), ...(r.directors ?? [])];

      people.forEach((p) => {
        const pid = p.id ?? p.name;
        if (!nodeMap.has(pid)) return;

        linkList.push({ source: r.id, target: pid });
      });
    });

    setNodes(Array.from(nodeMap.values()));
    setLinks(linkList);
  }, [movie, relatedMovies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // LINKS
    links.forEach((l) => {
      const s = nodes.find((n) => n.id === l.source);
      const t = nodes.find((n) => n.id === l.target);
      if (!s || !t) return;

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    });

    // NODES
    nodes.forEach((n) => {
      const isHovered = hoveredNode?.id === n.id;
      const isSelected = selectedNode?.id === n.id;

      const color =
        n.type === "movie"
          ? "#FF6B6B"
          : n.type === "actor"
          ? "#00D4D8"
          : "#FFFF00";

      const radius = isHovered || isSelected ? 14 : 10;

      if (isHovered || isSelected) {
        ctx.fillStyle = color + "33";
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(n.name, n.x, n.y + radius + 6);
    });

    ctx.restore();
  }, [nodes, links, hoveredNode, selectedNode, zoom, offset]);

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      return;
    }

    const { x, y } = getMousePos(e, canvas);
    const hit = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 15);
    setHoveredNode(hit || null);
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getMousePos(e, canvas);
    const hit = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 15);

    if (hit) {
      setSelectedNode(hit);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const cursorStyle =
    isDragging ? "grabbing" : hoveredNode ? "pointer" : "grab";

  return (
    <section className="transform scale-90 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <motion.div
            className="inline-flex items-center gap-3 bg-[#FFE66D]/10 border border-[#FFE66D]/30 rounded-full px-6 py-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Network className="w-5 h-5 text-[#FFE66D]" />
            <span className="text-[#FFE66D] text-sm">네트워크 시각화</span>
          </motion.div>

          <motion.h2
            className="text-3xl mb-3 text-[#FFFF00]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            영화 네트워크
          </motion.h2>

          <motion.p
            className="text-lg text-white/70 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            이 영화와 연결된 배우, 감독, 그리고 관련 작품들의 네트워크를 탐색해보세요.
          </motion.p>
        </div>

        {/* Graph Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#004D4F]/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative overflow-hidden"
        >
          {/* Zoom */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          {selectedNode && (
            <div
              className="
                absolute bottom-4 right-4
                w-96 bg-[#00393B]/80 backdrop-blur-lg
                border border-white/10 shadow-xl
                rounded-xl p-6 text-white z-30
              "
            >
              <h3 className="text-2xl text-[#FFFF00] mb-3 font-bold">
                {selectedNode.name}
              </h3>

              {selectedNode.type === "actor" && (
                <>
                  <p className="text-white/80 text-base mb-1">type: actor</p>
                  {selectedNode.character && (
                    <p className="text-white/80 text-base">
                      배역명: {selectedNode.character}
                    </p>
                  )}
                </>
              )}

              {selectedNode.type === "movie" && (
                <>
                  <p className="text-white/80 text-base mb-1">
                    개봉년도: {selectedNode.releaseYear ?? "?"}
                  </p>
                  <p className="text-white/80 text-base mb-4">
                    평점: {selectedNode.rating ?? "N/A"}
                  </p>

                  <button
                    onClick={() => {
                      navigate(`/detail/${selectedNode.id}`);
                      window.location.reload();
                    }}
                    className="w-full py-2 bg-[#FFE66D] hover:bg-[#FFF176]
                              text-black rounded-lg font-medium mt-1"
                  >
                    상세페이지 →
                  </button>
                </>
              )}
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: cursorStyle }}
          />
        </motion.div>
      </div>
    </section>
  );
}
