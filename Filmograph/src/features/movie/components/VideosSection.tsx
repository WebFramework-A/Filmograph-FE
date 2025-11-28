import "./styles/VideosSection.css";
import { Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type VideoItem = {
  key: string;
  site: string;
  name: string;
};

export default function VideosSection({ movie }: { movie: any }) {
  const videos = movie?.videos;

  const [openVideo, setOpenVideo] = useState<VideoItem | null>(null);

  const [vimeoThumbs, setVimeoThumbs] = useState<Record<string, string>>({});

  const fetchVimeoThumb = async (key: string) => {
    if (vimeoThumbs[key]) return vimeoThumbs[key];

    try {
      const res = await fetch(`https://vimeo.com/api/v2/video/${key}.json`);
      const data = await res.json();
      const thumb = data[0]?.thumbnail_large;

      setVimeoThumbs((prev) => ({ ...prev, [key]: thumb }));
      return thumb;
    } catch (err) {
      return "/fallback-thumb.png";
    }
  };

  useEffect(() => {
    const allVideos: VideoItem[] = [
      ...(videos?.trailers ?? []),
      ...(videos?.clips ?? []),
      ...(videos?.teasers ?? []),
    ];

    allVideos.forEach((v: VideoItem) => {
      if (v.site === "Vimeo" && !vimeoThumbs[v.key]) {
        fetchVimeoThumb(v.key);
      }
    });
  }, [videos, vimeoThumbs]);

  const [pageTrailer, setPageTrailer] = useState(0);
  const [pageClip, setPageClip] = useState(0);

  if (!videos || (!videos.trailers?.length && !videos.clips?.length))
    return null;

  const getEmbedUrl = (v: VideoItem) => {
    if (v.site === "YouTube")
      return `https://www.youtube.com/embed/${v.key}?autoplay=1`;
    if (v.site === "Vimeo")
      return `https://player.vimeo.com/video/${v.key}?autoplay=1`;
    return "";
  };

  return (
    <section className="videos-wrapper overflow-hidden">
      <div className="videos-container">
        <div className="videos-header">
          <Play className="videos-icon" />
          <h2 className="videos-title">영상</h2>
        </div>

        {videos.trailers?.length > 0 && (
          <VideoCategory
            title="트레일러"
            videos={videos.trailers}
            page={pageTrailer}
            setPage={setPageTrailer}
            onClick={(v) => setOpenVideo(v)}
          />
        )}

        {videos.clips?.length > 0 && (
          <VideoCategory
            title="클립"
            videos={videos.clips}
            isClip
            page={pageClip}
            setPage={setPageClip}
            onClick={(v) => setOpenVideo(v)}
          />
        )}
      </div>

      {openVideo && (
        <div
          className="video-modal-backdrop"
          onClick={() => setOpenVideo(null)}
        >
          <div
            className="video-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="video-modal-close"
              onClick={() => setOpenVideo(null)}
            >
              ✕
            </button>

            <iframe
              className="video-iframe"
              src={getEmbedUrl(openVideo)}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}

function VideoCategory({
  title,
  videos,
  isClip,
  page,
  setPage,
  onClick,
}: {
  title: string;
  videos: VideoItem[];
  isClip?: boolean;
  page: number;
  setPage: (p: number) => void;
  onClick: (v: VideoItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;

      if (width < 600) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(2);
      }
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const maxPage = Math.floor((videos.length - 1) / itemsPerPage);
  const visible = videos.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <div className="videos-block">
      <div className="videos-title-row">
        <h3 className="videos-subtitle">{title}</h3>

        {videos.length > itemsPerPage && (
          <div className="videos-pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              {"<"}
            </button>
            <button disabled={page === maxPage} onClick={() => setPage(page + 1)}>
              {">"}
            </button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="videos-grid"
        style={{
          gridTemplateColumns: `repeat(${itemsPerPage}, 1fr)`,
        }}
      >
        {visible.map((v, idx) => (
          <div
            key={idx}
            className={`video-card ${isClip ? "clip" : ""}`}
            onClick={() => onClick(v)}
          >
            <img
              className="video-thumb"
              src={
                v.site === "Vimeo"
                  ? `https://vumbnail.com/${v.key}.jpg`
                  : `https://img.youtube.com/vi/${v.key}/hqdefault.jpg`
              }
            />
            <div className="video-overlay" />
            <div className="video-center">
              <div className={`video-play-btn ${isClip ? "clip" : ""}`}>
                <Play className={`video-play-icon ${isClip ? "clip" : ""}`} />
              </div>
            </div>
            <div className="video-bottom">
              <p className="video-name">{v.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}