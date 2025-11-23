import "./styles/VideosSection.css";
import { Play } from "lucide-react";

export default function VideosSection({ movie }: { movie: any }) {
  const videos = movie?.videos;

  if (
    !videos ||
    (!videos.trailers?.length && !videos.clips?.length && !videos.teasers?.length)
  )
    return null;

  return (
    <section className="videos-wrapper">
      <div className="videos-container">
        <div className="videos-header">
          <Play className="videos-icon" />
          <h2 className="videos-title">영상</h2>
        </div>

        {videos.trailers && videos.trailers.length > 0 && (
          <div className="videos-block">
            <h3 className="videos-subtitle">트레일러</h3>

            <div className="videos-grid">
              {videos.trailers.map((v: any, idx: number) => (
                <a
                  key={idx}
                  className="video-card"
                  href={`https://www.youtube.com/watch?v=${v.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="video-overlay" />
                  <div className="video-center">
                    <div className="video-play-btn">
                      <Play className="video-play-icon" />
                    </div>
                  </div>
                  <div className="video-bottom">
                    <p className="video-name">{v.name}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {videos.clips && videos.clips.length > 0 && (
          <div className="videos-block">
            <h3 className="videos-subtitle">클립</h3>

            <div className="videos-grid">
              {videos.clips.map((v: any, idx: number) => (
                <a
                  key={idx}
                  className="video-card clip"
                  href={`https://www.youtube.com/watch?v=${v.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="video-overlay" />
                  <div className="video-center">
                    <div className="video-play-btn clip">
                      <Play className="video-play-icon clip" />
                    </div>
                  </div>
                  <div className="video-bottom">
                    <p className="video-name">{v.name}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
