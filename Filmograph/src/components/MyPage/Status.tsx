interface Props {
    status: {
        reviewCount: number;
        ratingCount: number;
        avgRating: number;
    };
}

export default function Status({ status }: Props) {
    return (
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md h-full">
            <h3 className="text-xl font-bold text-yellow-200 mb-6 flex items-center gap-2">
                활동 통계
            </h3>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg">작성한 리뷰</span>
                    <span className="text-3xl font-bold">{status.reviewCount}</span>
                </div>

                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-[#FFD700] h-full transition-all duration-500"
                        style={{ width: "30%" }}
                    ></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg">평균 평점</span>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-[#4FC3F7]">
                            {status.avgRating}
                        </span>
                        <span className="text-sm text-white/50 ml-1">/ 5.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}