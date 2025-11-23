// src/features/movie/components/MovieGraphSection.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { db } from "../../../services/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./styles/MovieGraphSection.css";
 
type NodeT = {
  id: string;
  name: string;
  type: "movie" | "person";
  role?: "actor" | "director" | "related_movie" | "movie";
  val?: number;
  x?: number;
  y?: number;
};

type LinkT = {
  source: string;
  target: string;
  type?: string;
};

interface Props {
  movieId: string;
}

// 색상 테마
const MOVIE_COLOR = "#FFFF00";
const ACTOR_COLOR = "#4ECDC4";
const DIRECTOR_COLOR = "#FFD93D";
const RELATED_MOVIE_COLOR = "#AAAAAA";

const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 650;

export default function MovieGraphSection({ movieId }: Props) {
  const [graph, setGraph] = useState<{ nodes: NodeT[]; links: LinkT[] }>({
    nodes: [],
    links: []
  });

  const fgRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGraph() {
      const nodes: NodeT[] = [];
      const links: LinkT[] = [];

      const movieRef = doc(db, "movies", movieId);
      const movieSnap = await getDoc(movieRef);

      if (!movieSnap.exists()) return;
      const movie = movieSnap.data();

      nodes.push({
        id: movieId,
        name: movie.title,
        type: "movie",
        role: "movie",
        val: 5
      });

      const castNames = movie.cast?.map((c: any) => c.name) || [];
      const directorNames = movie.directors?.map((d: any) => d.name) || [];

      castNames.forEach((name) => {
        nodes.push({
          id: name,
          name,
          type: "person",
          role: "actor",
          val: 2
        });

        links.push({
          source: movieId,
          target: name,
          type: "acted_in"
        });
      });

      directorNames.forEach((name) => {
        nodes.push({
          id: name,
          name,
          type: "person",
          role: "director",
          val: 2
        });

        links.push({
          source: movieId,
          target: name,
          type: "directed"
        });
      });

      const moviesSnap = await getDocs(collection(db, "movies"));
      const relatedMovies: any[] = [];

      moviesSnap.forEach((doc) => {
        if (doc.id === movieId) return;

        const m = doc.data();
        const castMatch = m.cast?.some((c: any) => castNames.includes(c.name));
        const dirMatch = m.directors?.some((d: any) =>
          directorNames.includes(d.name)
        );

        if (castMatch || dirMatch) {
          relatedMovies.push({ id: doc.id, ...m });
        }
      });

      relatedMovies.slice(0, 5).forEach((m) => {
        nodes.push({
          id: m.id,
          name: m.title,
          type: "movie",
          role: "related_movie",
          val: 3
        });

        links.push({
          source: movieId,
          target: m.id,
          type: "related_movie"
        });
      });

      setGraph({ nodes, links });
    }

    loadGraph();
  }, [movieId]);

  useEffect(() => {
    if (fgRef.current && graph.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 400);
    }
  }, [graph]);

  const graphData = useMemo(() => graph, [graph]);

  if (graph.nodes.length === 0)
    return <div className="text-white">관계망 데이터 없음</div>;

  return (
    <section className="graph-wrapper">
      <div className="graph-container">
        <div className="graph-header">
          <div className="graph-chip">관계망 그래프</div>
          <h2 className="graph-title">영화 관계망</h2>
          <p className="graph-desc">
            이 영화와 연결된 배우, 감독 및 관련 작품의 관계망을 시각화합니다.
          </p>
        </div>

        <div className="graph-canvas-box">
          <ForceGraph2D
            ref={fgRef}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            backgroundColor="transparent"
            graphData={graphData}
            nodeId="id"
            nodeLabel="name"
            linkColor={(link: any) => {
              if (link.type === "acted_in")
                return "rgba(78,205,196,0.5)";
              if (link.type === "directed")
                return "rgba(255,217,61,0.6)";
              return "rgba(255,255,255,0.2)";
            }}
            linkWidth={(link: any) => (link.type ? 2 : 1)}

            {...({
              d3Force: (name: string, force: any) => {
                if (name === "charge") force.strength(-70);
                if (name === "link") force.distance(75).strength(1);
              }
            } as any)}

            onNodeClick={(node: NodeT) => {
              if (node.role === "related_movie") {
                navigate(`/movie/${node.id}`);
              }
            }}

            nodeCanvasObject={(nodeRaw: any, ctx: CanvasRenderingContext2D, scale: number) => {
              const node = nodeRaw as NodeT;
              const size = (node.val ?? 2) * 4;

              let color = MOVIE_COLOR;
              if (node.role === "actor") color = ACTOR_COLOR;
              if (node.role === "director") color = DIRECTOR_COLOR;
              if (node.role === "related_movie") color = RELATED_MOVIE_COLOR;

              ctx.save();

              if (node.role === "movie") {
                ctx.shadowColor = "rgba(255,255,0,0.7)";
                ctx.shadowBlur = 20;
              }

              ctx.beginPath();
              ctx.fillStyle = color;
              ctx.arc(node.x!, node.y!, size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              if (scale > 1.2) {
                ctx.font = `600 ${11 / scale}px Pretendard`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "white";
                ctx.fillText(node.name, node.x!, node.y! + size + 4);
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}