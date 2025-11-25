import "./styles/VideosSection.css";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";

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
      console.error("Vimeo thumbnail fetch failed", err);
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

  if (
    !videos ||
    (!videos.trailers?.length &&
      !videos.clips?.length &&
      !videos.teasers?.length)
  )
    return null;

  const getEmbedUrl = (v: VideoItem) => {
    if (v.site === "YouTube")
      return `https://www.youtube.com/embed/${v.key}?autoplay=1`;

    if (v.site === "Vimeo")
      return `https://player.vimeo.com/video/${v.key}?autoplay=1`;

    return "";
  };

  const pageSize = 2;

  const paginate = (arr: VideoItem[], page: number) =>
    arr.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <section className="videos-wrapper">
      <div className="videos-container">
        <div className="videos-header">
          <Play className="videos-icon" />
          <h2 className="videos-title">영상</h2>
        </div>

        {videos.trailers && videos.trailers.length > 0 && (
          <VideoCategory
            title="트레일러"
            page={pageTrailer}
            setPage={setPageTrailer}
            videos={paginate(videos.trailers, pageTrailer)}
            totalCount={videos.trailers.length}
            pageSize={pageSize}
            onClick={(v: VideoItem) => setOpenVideo(v)}
          />
        )}

        {videos.clips && videos.clips.length > 0 && (
          <VideoCategory
            title="클립"
            isClip
            page={pageClip}
            setPage={setPageClip}
            videos={paginate(videos.clips, pageClip)}
            totalCount={videos.clips.length}
            pageSize={pageSize}
            onClick={(v: VideoItem) => setOpenVideo(v)}
          />
        )}
      </div>

      {openVideo && (
        <div className="video-modal-backdrop" onClick={() => setOpenVideo(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setOpenVideo(null)}>
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
  totalCount,
  page,
  setPage,
  pageSize,
  isClip,
  onClick,
}: {
  title: string;
  videos: VideoItem[];
  totalCount: number;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  isClip?: boolean;
  onClick: (v: VideoItem) => void;
}) {
  const maxPage = Math.floor((totalCount - 1) / pageSize);

  return (
    <div className="videos-block">
      <div className="videos-title-row">
        <h3 className="videos-subtitle">{title}</h3>

        {totalCount > pageSize && (
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

      <div className="videos-grid">
        {videos.map((v: VideoItem, idx: number) => (
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