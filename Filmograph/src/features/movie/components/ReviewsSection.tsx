import { useEffect, useState, useCallback, useRef } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { type Review } from "../../review/types/review";
import { deleteReview } from "../../review/services/reviewService"; // 삭제 서비스
import { useAuth } from "../../auth/hooks/useAuth"; // 내 정보 확인용
import ReviewForm from "./ReviewForm";

interface Props {
    movie: { id: string; title: string };
}

export default function ReviewsSection({ movie }: Props) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // 현재 수정 중인 리뷰 데이터
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const formRef = useRef<HTMLDivElement>(null);

    const fetchReviews = useCallback(async () => {
        try {
            const q = query(
                collection(db, "reviews"),
                where("movieId", "==", String(movie.id)),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(data);
        } catch (error) {
            console.error("실패:", error);
        } finally {
            setLoading(false);
        }
    }, [movie.id]);

    useEffect(() => {
        if (movie.id) fetchReviews();
    }, [movie.id, fetchReviews]);

    // 삭제 핸들러
    const handleDelete = async (review: Review) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteReview(review.id, review.movieId, review.userId, review.rating);
            alert("삭제되었습니다.");
            fetchReviews();
        } catch (error) {
            console.error("삭제 실패", error);
            alert("삭제 실패");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                관람객 리뷰 <span className="text-white/60 text-lg">({reviews.length})</span>
            </h2>

            {/* 폼에 editingReview를 전달 */}
            <div ref={formRef} className="scroll-mt-24">
                <ReviewForm
                    movieId={movie.id}
                    movieTitle={movie.title}
                    onReviewSubmitted={() => {
                        fetchReviews();
                        setEditingReview(null);
                    }}
                    initialData={editingReview}
                    onCancelEdit={() => setEditingReview(null)}
                />
            </div>

            {loading ? (
                <div className="text-center text-white/50">로딩 중...</div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-black/20 p-5 rounded-lg border border-white/5 relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
                                        {/* 익명이 아니고 프사가 있으면 표시 */}
                                        {!review.isAnonymous && review.userInfo?.photoURL && (
                                            <img src={review.userInfo.photoURL} alt="user" className="w-full h-full object-cover" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {/* 익명 여부에 따라 닉네임 표시 */}
                                            {review.isAnonymous ? "익명" : (review.userInfo?.nickname || "익명")}
                                        </p>
                                        <p className="text-[10px] text-white/40">
                                            {review.createdAt?.seconds
                                                ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                                : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* 오른쪽: 별점 및 버튼 그룹 (Flex로 묶음) */}
                                <div className="flex flex-col items-end gap-2">
                                    {/* 별점 */}
                                    <div className="flex text-yellow-400 font-bold items-center gap-1">
                                        <span>★</span>
                                        <span>{review.rating}</span>
                                    </div>

                                    {/* 수정/삭제 버튼 (본인일 때만 표시) */}
                                    {user && user.uid === review.userId && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingReview(review);
                                                    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }}
                                                className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review)}
                                                className="text-xs bg-red-500/20 hover:bg-red-500/40 px-2 py-1 rounded text-red-300"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {review.content}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-black/10 rounded-lg text-white/50">
                    첫 리뷰를 남겨보세요!
                </div>
            )}
        </div>
    );
}