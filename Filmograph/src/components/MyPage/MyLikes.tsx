import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WishlistItem } from "../../pages/MyPage"; // 타입 가져오기

interface Props {
    likes: WishlistItem[];
}

export default function MyLikes({ likes }: Props) {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false); // 모두 보기 상태

    return (
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md flex flex-col h-full relative transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2">
                    <span>♥</span> 찜한 영화
                    <span className="text-sm text-white/60 font-normal">({likes.length})</span>
                </h3>

                {/* 3개 이상일 때만 버튼 표시 */}
                {likes.length > 2 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs text-white/70 hover:text-white bg-white/10 px-2 py-1 rounded transition-colors"
                    >
                        {showAll ? "접기 ▲" : "모두 보기 ▶"}
                    </button>
                )}
            </div>

            {likes.length > 0 ? (
                <div className="flex-1">

                    {/* 모드 1: 최신 2개 포스터 미리보기 (showAll이 false일 때) */}
                    {!showAll ? (
                        <div className="grid grid-cols-2 gap-4">
                            {likes.slice(0, 2).map((movie) => (
                                <div
                                    key={movie.id}
                                    className="relative group cursor-pointer"
                                    onClick={() => navigate(`/detail`)} // 상세페이지 이동
                                >
                                    <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800 shadow-lg border border-white/10 group-hover:border-[#FFD700] transition-all">
                                        {movie.posterUrl ? (
                                            <img
                                                src={movie.posterUrl}
                                                alt={movie.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">No Poster</div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <h4 className="text-sm font-bold truncate px-1 text-white/90">{movie.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (

                        // 모드 2: 전체 리스트 보기 (showAll이 true일 때)
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
                            {likes.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => navigate(`/detail`)}
                                    className="flex items-center gap-3 bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer transition border border-transparent hover:border-white/20"
                                >
                                    {/* 리스트에서도 작은 썸네일 표시 */}
                                    <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                        {movie.posterUrl && <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-left text-white/90">{movie.title}</p>
                                        <p className="text-xs text-white/50 text-left">
                                            {movie.addedAt ? new Date(movie.addedAt.toDate()).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white/50 text-sm py-8">
                    아직 찜한 영화가 없습니다.
                </div>
            )}
        </div>
    );
}