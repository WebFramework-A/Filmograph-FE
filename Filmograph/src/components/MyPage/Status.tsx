import { LevelDefinition } from "../../utils/levelUtils";

interface ProgressData {
    nextLevelName: string;
    reviewsLeft: number;
    likesLeft: number;
    totalProgress: number;
    targetReviews: number;
    targetLikes: number;
}

interface Props {
    currentLevel: LevelDefinition;
    reviewCount: number;
    likeCount: number;
    progress: ProgressData | null;
}

export default function Status({ currentLevel, reviewCount, likeCount, progress }: Props) {
    // 만렙인 경우
    if (!progress) {
        return (
            <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md flex flex-col justify-center items-center h-full">
                <h3 className="text-2xl font-bold text-[#E040FB] mb-2"> MAX LEVEL !!!</h3>
                <p className="text-white/70">모든 업적을 달성하셨습니다!</p>
                <p className="mt-4 text-sm text-white/50">현재 {reviewCount}개의 리뷰와 {likeCount}개의 찜을 보유 중</p>
            </div>
        );
    }

    return (
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md h-full flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-yellow-200 mb-1">레벨업 진행 상황</h3>
                <p className="text-sm text-white/60 mb-6">
                    다음 등급 <span className="text-[#4FC3F7] font-bold">'{progress.nextLevelName}'</span>까지
                </p>

                {/* 미션 목록 */}
                <div className="space-y-4 mb-6">
                    {/* 리뷰 미션 */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/80">📝 리뷰 작성</span>
                            <span className={progress.reviewsLeft <= 0 ? "text-green-400" : "text-white/50"}>
                                {progress.reviewsLeft <= 0
                                    ? "완료!"
                                    : `${progress.reviewsLeft}개 남음`}
                            </span>
                        </div>
                        {/* 개별 진행바 */}
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${progress.reviewsLeft <= 0 ? "bg-green-400" : "bg-white/40"}`}
                                style={{ width: `${Math.min(100, (reviewCount / progress.targetReviews) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 찜 미션 */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/80">♥ 찜한 영화</span>
                            <span className={progress.likesLeft <= 0 ? "text-green-400" : "text-white/50"}>
                                {progress.likesLeft <= 0
                                    ? "완료!"
                                    : `${progress.likesLeft}개 남음`}
                            </span>
                        </div>
                        {/* 개별 진행바 */}
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${progress.likesLeft <= 0 ? "bg-green-400" : "bg-white/40"}`}
                                style={{ width: `${Math.min(100, (likeCount / progress.targetLikes) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 전체 통합 진행률 */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-white/40">Total Progress</span>
                    <span className="text-2xl font-bold text-[#FFD700]">{progress.totalProgress}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-3 border border-white/10">
                    <div
                        className="bg-gradient-to-r from-yellow-600 to-yellow-300 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                        style={{ width: `${progress.totalProgress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}