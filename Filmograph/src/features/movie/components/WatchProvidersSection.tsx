import "./styles/WatchProvidersSection.css";
import { Tv } from "lucide-react";

export default function WatchProvidersSection({ movie }: { movie: any }) {
  const providers = movie?.watchProviders;

  // ⚠ 데이터 없으면 전체 섹션 숨김 (오류 방지)
  if (!providers || !Array.isArray(providers) || providers.length === 0) {
    return null;
  }

  return (
    <section className="providers-wrapper">
      <div className="providers-container">
        <div className="providers-header">
          <Tv className="providers-icon" />
          <h2 className="providers-title">시청 가능 플랫폼</h2>
        </div>

        <div className="providers-grid">
          {providers.map((p: any, idx: number) => (
            <div key={idx} className="provider-card">
              <div className="provider-logo-bg">
                <Tv className="provider-logo-icon" />
              </div>

              <p className="provider-name">{p.providerName}</p>
              <p className="provider-type">
                {p.type === "flatrate"
                  ? "구독"
                  : p.type === "rent"
                  ? "대여"
                  : "구매"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}