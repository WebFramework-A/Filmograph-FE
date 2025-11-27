import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { addReview, updateReview } from "../../review/services/reviewService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { type Review } from "../../review/types/review";

interface Props {
    movieId: string;
    movieTitle: string;
    onReviewSubmitted: () => void; // 리뷰 작성 후 목록 새로고침용 함수
    initialData?: Review | null;   // 수정 시 기존 데이터 받기
    onCancelEdit?: () => void;     // 수정 취소 버튼용 함수
}

// props에서 initialData, onCancelEdit를 '구조 분해 할당'으로 받아
export default function ReviewForm({
    movieId,
    movieTitle,
    onReviewSubmitted,
    initialData,
    onCancelEdit
}: Props) {
    const { user } = useAuth();

    // 상태 관리
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5); // 기본 별점 5점
    const [isAnonymous, setIsAnonymous] = useState(false); // 익명 여부
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 로딩 상태

    // 수정 모드일 때 초기값 채워넣기
    // initialData가 변경될 때마다(수정 버튼 클릭 시) 폼을 해당 데이터로 채웁니다.
    useEffect(() => {
        if (initialData) {
            setContent(initialData.content);
            setRating(initialData.rating);
            setIsAnonymous(initialData.isAnonymous || false);
        } else {
            // 수정 모드가 아니면(작성 모드) 폼 초기화
            setContent("");
            setRating(5);
            setIsAnonymous(false);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 리뷰 작성 없이 별점만 해도 등록 가능하게 변경
        /*
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }
        */

        setIsSubmitting(true);
        try {
            // Firestore에서 최신 유저 정보(닉네임) 가져오기
            // (Auth 정보는 토큰 갱신 전까지 옛날 닉네임일 수 있어서 DB를 직접 조회합니다)
            const userDocRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userDocRef);

            let currentNickname = user.displayName || "익명";
            const currentPhoto = user.photoURL || "";

            if (userSnapshot.exists()) {
                const u = userSnapshot.data();
                if (u.nickname) currentNickname = u.nickname;
            }

            // 수정 모드 vs 작성 모드 분기 처리
            if (initialData) {
                // [수정 모드] updateReview 호출
                await updateReview({
                    reviewId: initialData.id,
                    movieId,
                    content,
                    rating,
                    oldRating: initialData.rating, // 평점 재계산을 위해 이전 점수 필요
                    isAnonymous,
                    userInfo: { nickname: currentNickname, photoURL: currentPhoto }
                });
                alert("리뷰가 수정되었습니다.");
            }
            else {
                // [작성 모드] addReview 호출
                await addReview({
                    userId: user.uid,
                    movieId,
                    movieTitle,
                    content,
                    rating,
                    isAnonymous,
                    userInfo: {
                        // 익명이면 "익명"으로 저장, 아니면 닉네임 저장
                        nickname: isAnonymous ? "익명" : currentNickname,
                        photoURL: isAnonymous ? "" : currentPhoto
                    },
                });
                alert("리뷰가 등록되었습니다!");
            }

            // 폼 초기화 및 목록 갱신
            setContent("");
            setRating(5);
            setIsAnonymous(false);
            onReviewSubmitted(); // 부모 컴포넌트에게 새로고침하라고 알림

        }
        catch (error) {
            console.error("리뷰 처리 실패:", error);
            alert("작업에 실패했습니다.");
        }
        finally {
            setIsSubmitting(false); // 로딩 끝
        }
    };

    // 로그인이 안 되어 있을 때 보여줄 화면
    if (!user) {
        return (
            <div className="bg-black/20 p-6 rounded-lg border border-white/10 text-center text-white/50">
                리뷰를 작성하려면 로그인이 필요합니다.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-black/30 p-6 rounded-lg border border-white/10 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                    {/* initialData 유무에 따라 제목 변경 */}
                    {initialData ? "리뷰 수정하기" : "리뷰 작성하기"}
                </h3>

                {/* 익명 체크박스 */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className="text-sm text-white/70">익명으로 남기기</span>
                </label>
            </div>

            {/* 별점 선택 영역 */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-white/70 text-sm">별점:</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-600"
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <span className="text-yellow-400 font-bold ml-2">{rating}점</span>
            </div>

            {/* 내용 입력 영역 */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded p-3 text-white focus:outline-none focus:border-yellow-400 transition resize-none h-24"
                placeholder="감상평을 남겨주세요 (최대 500자)"
                maxLength={500}
            />

            {/* 버튼 영역 */}
            <div className="flex justify-end mt-3 gap-2">
                {/* 수정 모드일 때만 '취소' 버튼 표시 */}
                {initialData && onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    >
                        취소
                    </button>
                )}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-yellow-400 text-black font-bold px-6 py-2 rounded hover:bg-yellow-300 transition disabled:opacity-50"
                >
                    {isSubmitting ? "처리 중..." : (initialData ? "수정완료" : "등록하기")}
                </button>
            </div>
        </form>
    );
}