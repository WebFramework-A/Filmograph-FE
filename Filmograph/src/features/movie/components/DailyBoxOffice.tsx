import { useEffect, useState } from "react";
import { getDailyBoxOffice, type BoxOfficeMovie } from "../services/boxOfficeService";
import { useNavigate } from "react-router-dom";

export default function DailyBoxOffice() {
    const [movies, setMovies] = useState<BoxOfficeMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getDailyBoxOffice()
            .then(setMovies)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-white/50 text-center py-10">오늘의 박스오피스 로딩 중...</div>;
    if (movies.length === 0) return null;

    return (
        <div className="w-full py-8 overflow-hidden group">

            {/* 흐르는 애니메이션 컨테이너 */}
            <div
                className="flex gap-6 w-max hover:[animation-play-state:paused]"
                style={{ animation: "scroll 40s linear infinite" }}
            >
                {/* 무한 스크롤을 위해 리스트 두 번 반복 */}
                {[...movies, ...movies].map((movie, index) => (
                    <div
                        key={`${movie.rank}-${index}`}
                        className="relative w-[160px] flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                        onClick={() => navigate(`/detail/${movie.tmdbId}`)} // ID가 있으면 상세 이동
                    >
                        {/* 순위 */}
                        <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-black/80 border border-[#FFD700] rounded-full flex items-center justify-center text-[#FFD700] font-bold shadow-lg">
                            {movie.rank}
                        </div>

                        {/* 포스터 */}
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 border border-white/10">
                            {movie.posterUrl ? (
                                <img src={movie.posterUrl} alt={movie.movieNm} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs p-2 text-center">
                                    {movie.movieNm}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 애니메이션 정의*/}
            <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}