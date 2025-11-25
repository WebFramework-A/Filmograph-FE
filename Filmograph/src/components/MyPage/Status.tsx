import { ReactNode } from "react";

interface StatusProps {
    status: {
        reviewCount: number;
        ratingCount: number;
        avgRating: number;
    };
}

export default function Status({ status }: StatusProps) {
    return (
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-bold text-yellow-200 mb-4">내 활동 요약</h3>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-white">{status.reviewCount}</div>
                    <div className="text-xs text-white/60 mt-1">리뷰</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-white">{status.ratingCount}</div>
                    <div className="text-xs text-white/60 mt-1">평가</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-[#FFD700]">{status.avgRating}</div>
                    <div className="text-xs text-white/60 mt-1">평점</div>
                </div>
            </div>

            <div className="flex-1">
                <h4 className="text-sm font-bold text-white/80 mb-3">최근 활동</h4>
                {/* 더미 데이터 리뷰 목록 */}
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded text-sm">
                            <div className="w-8 h-8 rounded bg-gray-600 flex-shrink-0"></div>
                            <div>
                                <p className="font-bold text-white">영화 제목 {i}</p>
                                <p className="text-white/60 text-xs line-clamp-2">
                                    이 영화는 정말 인상 깊었습니다. 연출과 연기가 모두 훌륭하네요.
                                    다음에도 다시 보고 싶은 작품입니다. (더미 리뷰입니다)
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}