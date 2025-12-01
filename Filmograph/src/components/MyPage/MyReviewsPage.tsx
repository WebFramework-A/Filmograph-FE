import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../services/data/firebaseConfig";
import { type Review } from "../../types/review";
import { deleteReview } from "../../services/review/reviewService";

export default function MyReviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  //리뷰 데이터 가져오기
  const fetchMyReviews = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Review)
      );
      setReviews(data);
    } catch (error) {
      console.error("내 리뷰 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // user가 바뀔 때만 함수 재생성

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  // 삭제 핸들러
  const handleDelete = async (e: React.MouseEvent, review: Review) => {
    e.stopPropagation();
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

    try {
      await deleteReview(
        review.id,
        review.movieId,
        review.userId,
        review.rating
      );
      // 목록에서 즉시 제거
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (error) {
      console.error("리뷰 삭제 실패", error);
      alert("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex border-b border-white/20 pb-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-yellow-400 transition"
          >
            ←
          </button>
          <h2 className="text-4xl font-bold text-yellow-200">
            내가 쓴 리뷰 목록
          </h2>
        </div>

        {loading ? (
          <div className="text-center">로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-white/50 py-20 bg-black/20 rounded-xl">
            작성한 리뷰가 없습니다.
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-black/20 p-6 rounded-xl border border-white/10 hover:border-yellow-400/50 transition relative group"
              >
                {/* 상단 영역 */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-xl font-bold text-white mb-1 cursor-pointer hover:underline hover:text-yellow-200"
                      onClick={() => navigate(`/detail/${review.movieId}`)}
                    >
                      {review.movieTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-white/40">
                      <span>
                        {review.createdAt?.seconds
                          ? new Date(
                            review.createdAt.seconds * 1000
                          ).toLocaleDateString() + " 작성"
                          : ""}
                      </span>
                      {review.isAnonymous && (
                        <span className="text-xs bg-white/10 px-1 rounded">
                          익명
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 쓰레기통 아이콘 (오른쪽 상단) */}
                  <button
                    onClick={(e) => handleDelete(e, review)}
                    className="text-white/30 hover:text-red-400 transition p-2 rounded-full hover:bg-white/5"
                    title="삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* 별점 (내용 위로 배치) */}
                <div className="mb-3">
                  <span className="bg-yellow-400 text-black font-bold px-3 py-1 rounded-full shadow-lg inline-block">
                    ★ {review.rating}
                  </span>
                </div>

                <p className="text-white/80 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
