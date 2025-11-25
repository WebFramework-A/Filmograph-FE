import { useState, useEffect, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
// [추가] 레벨 계산 로직 임포트 (경로 확인 필요)
import { calculateUserLevel, getNextLevelProgress } from "../../utils/levelUtils";

interface Props {
    userInfo: any;
    currentUser: any;
    // [추가] 레벨 계산을 위한 props
    reviewCount: number;
    likeCount: number;
}

export default function Profile({ userInfo, currentUser, reviewCount, likeCount }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState("");
    const [displayNickname, setDisplayNickname] = useState("");

    // 초기 데이터 설정
    useEffect(() => {
        if (userInfo?.nickname) {
            setNewNickname(userInfo.nickname);
            setDisplayNickname(userInfo.nickname);
        }
        else if (currentUser?.displayName) {
            setNewNickname(currentUser.displayName);
            setDisplayNickname(currentUser.displayName);
        }
    }, [userInfo, currentUser]);

    // [추가] 레벨 및 진행도 계산
    const currentLevel = useMemo(() =>
        calculateUserLevel(reviewCount, likeCount),
        [reviewCount, likeCount]);

    const progress = useMemo(() =>
        getNextLevelProgress(currentLevel.level, reviewCount, likeCount),
        [currentLevel, reviewCount, likeCount]);


    // 프로필 업데이트 핸들러
    const handleUpdateProfile = async () => {
        if (!newNickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }
        if (!currentUser) return;

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                nickname: newNickname
            });

            setDisplayNickname(newNickname);
            setIsEditing(false);
            alert("프로필이 수정되었습니다.");

        } catch (error) {
            console.error("프로필 업데이트 실패:", error);
            alert("프로필 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 왼쪽: 프로필 사진 및 닉네임 */}
            <div className="flex gap-6 items-center">
                <img
                    src={userInfo.photoURL || currentUser?.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-yellow-200 object-cover shadow-lg"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-avatar.png";
                    }}
                />

                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex flex-col gap-2 items-start">
                            <input
                                type="text"
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                                className="bg-white/10 border border-white/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                                placeholder="새 닉네임"
                                maxLength={10}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="text-xs bg-[#FFD700] text-black px-3 py-1 rounded font-bold hover:bg-[#FFC107] transition-colors"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewNickname(displayNickname);
                                    }}
                                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold break-all">
                                    {displayNickname || "영화 팬"}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-white/50 hover:text-[#FFD700] border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap flex-shrink-0"
                                    title="닉네임 수정"
                                >
                                    수정
                                </button>
                            </div>

                            <p className="text-[#FFD700] mb-2 opacity-80">
                                @{currentUser?.email?.split("@")[0]}
                            </p>

                            {/* [수정] 동적 레벨 배지 표시 */}
                            <span
                                className="px-3 py-1 rounded-full text-sm font-bold shadow-sm inline-block"
                                style={{
                                    backgroundColor: currentLevel.color,
                                    color: currentLevel.level === 1 ? 'black' : 'black' // 색상에 따라 텍스트색 조정 가능
                                }}
                            >
                                Lv.{currentLevel.level} {currentLevel.name}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* 오른쪽: 정보 및 레벨업 진행 상황 (기존 '상태' 부분 대체) */}
            <div className="bg-black/20 p-6 rounded-lg text-sm space-y-3 backdrop-blur-sm border border-white/5 shadow-md flex flex-col justify-center">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/70">이메일</span>
                    <span>{currentUser?.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-white/70">가입일</span>
                    <span>
                        {userInfo.createdAt
                            ? new Date(userInfo.createdAt).toLocaleDateString()
                            : "-"}
                    </span>
                </div>

                {/* [수정] 상태(활동중) 대신 레벨업 목표 표시 */}
                {progress ? (
                    <div className="pt-2">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-yellow-200 font-bold">
                                Next: {progress.nextLevelName}
                            </span>
                            <span className="text-[10px] text-white/50">
                                달성률 {progress.totalProgress}%
                            </span>
                        </div>

                        {/* 리뷰 미션 바 */}
                        <div className="mb-2">
                            <div className="flex justify-between text-[10px] mb-1 text-white/70">
                                <span>리뷰 작성 ({reviewCount}/{progress.targetReviews})</span>
                                <span className={progress.reviewsLeft <= 0 ? "text-green-400" : ""}>
                                    {progress.reviewsLeft <= 0 ? "완료" : `${progress.reviewsLeft}개 남음`}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${progress.reviewsLeft <= 0 ? "bg-green-400" : "bg-[#4FC3F7]"}`}
                                    style={{ width: `${Math.min(100, (reviewCount / progress.targetReviews) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* 찜 미션 바 */}
                        <div>
                            <div className="flex justify-between text-[10px] mb-1 text-white/70">
                                <span>찜하기 ({likeCount}/{progress.targetLikes})</span>
                                <span className={progress.likesLeft <= 0 ? "text-green-400" : ""}>
                                    {progress.likesLeft <= 0 ? "완료" : `${progress.likesLeft}개 남음`}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${progress.likesLeft <= 0 ? "bg-green-400" : "bg-[#FF6B6B]"}`}
                                    style={{ width: `${Math.min(100, (likeCount / progress.targetLikes) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 만렙일 경우
                    <div className="pt-2 text-center">
                        <p className="text-[#E040FB] font-bold">최고 레벨 달성!</p>
                        <p className="text-xs text-white/50">모든 미션을 완료했습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}