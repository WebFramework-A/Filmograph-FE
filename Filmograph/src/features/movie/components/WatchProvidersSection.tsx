import "./styles/WatchProvidersSection.css";
import { Tv } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";

const PROVIDER_LINKS: Record<string, string> = {
  "Watcha": "https://watcha.com",
  "wavve": "https://www.wavve.com",
  "Google Play Movies": "https://play.google.com/store/movies",
  "Netflix": "https://www.netflix.com",
  "Disney Plus": "https://www.disneyplus.com",
  "Apple TV": "https://tv.apple.com",
};

export default function WatchProvidersSection({ movie }: { movie: any }) {
  const providers = movie?.watchProviders;

  if (!providers || providers.length === 0) return null;

  return (
    <section className="providers-wrapper overflow-hidden">
      <div className="providers-container">
        <div className="providers-header">
          <Tv className="providers-icon" />
          <h2 className="providers-title">시청 가능 플랫폼</h2>
        </div>

        <div className="providers-grid">
          {providers.map((p: any, idx: number) => {
            const link = PROVIDER_LINKS[p.providerName] || "#";

            return (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="provider-card"
              >
                <div className="provider-logo-wrapper">
                  <ImageWithFallback
                    src={p.logoUrl}
                    alt={p.providerName}
                    className="provider-logo-img"
                  />
                </div>

                <p className="provider-name">{p.providerName}</p>

                <p className="provider-type">
                  {p.type === "flatrate"
                    ? "구독"
                    : p.type === "rent"
                    ? "대여"
                    : "구매"}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}