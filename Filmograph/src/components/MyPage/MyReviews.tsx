import { useNavigate } from "react-router-dom";
import { type Review } from "../../types/review";
import { deleteReview } from "../../services/review/reviewService";
import { useAuth } from "../../hooks/useAuth";

interface StatusProps {
  status: {
    reviewCount: number;
    ratingCount: number;
    avgRating: number;
  };
  recentReviews: Review[]; // 최근 리뷰 데이터 받기
  onReviewDeleted?: () => void; // 삭제 후 콜백
}

export default function Status(props: StatusProps) {
  // props 전체를 받음
  const { status, recentReviews, onReviewDeleted } = props; // 여기서 분해 할당
  const navigate = useNavigate();
  const { user } = useAuth(); // 본인 확인용

  // 삭제 핸들러
  const handleDelete = async (e: React.MouseEvent, review: Review) => {
    e.stopPropagation(); // 카드 클릭(상세 페이지 이동) 방지
    if (!user) return;
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

    try {
      await deleteReview(
        review.id,
        review.movieId,
        review.userId,
        review.rating
      );
      alert("삭제되었습니다.");

      // 부모 컴포넌트에 알림 (목록 새로고침)
      if (onReviewDeleted) {
        onReviewDeleted();
      } else {
        window.location.reload(); // 콜백 없으면 강제 새로고침 (안전장치)
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 실패");
    }
  };

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md flex flex-col h-full">
      <h3 className="text-xl font-bold text-yellow-200 mb-4">내 활동 요약</h3>

      {/* 통계 수치 */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {status.reviewCount}
          </div>
          <div className="text-xs text-white/60 mt-1">리뷰</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {status.ratingCount}
          </div>
          <div className="text-xs text-white/60 mt-1">평가</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-2xl font-bold text-[#FFD700]">
            {isNaN(status.avgRating) ? 0 : status.avgRating.toFixed(1)}
          </div>
          <div className="text-xs text-white/60 mt-1">평점</div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white/80">최근 리뷰 활동</h4>
          {/* 리뷰가 3개 이상이면 모두 보기 버튼 표시 */}
          {status.reviewCount > 3 && (
            <button
              onClick={() => navigate("/review")}
              className="text-xs text-white/50 hover:text-[#FFD700] transition-colors"
            >
              모두 보기 ▶
            </button>
          )}
        </div>

        {/* 실제 리뷰 데이터 매핑 */}
        {recentReviews.length > 0 ? (
          <div className="space-y-3">
            {/* [수정] 여기서 최신 4개만 잘라서 출력 */}
            {recentReviews.slice(0, 4).map((review) => (
              <div
                key={review.id}
                className="flex justify-between items-center bg-white/5 p-3 rounded text-sm hover:bg-white/10 transition cursor-pointer group relative"
                onClick={() => navigate(`/detail/${review.movieId}`)} // 클릭 시 해당 영화 상세로 이동
              >
                {/* 영화 제목 및 날짜 */}
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <span className="text-lg">🎬</span>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                      {review.movieTitle}
                    </p>
                    <p className="text-white/40 text-xs">
                      {review.createdAt?.seconds
                        ? new Date(
                          review.createdAt.seconds * 1000
                        ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* 별점 및 삭제 버튼 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#FFD700] font-bold shrink-0">
                    <span>★</span>
                    <span>{review.rating}</span>
                  </div>

                  {/* 쓰레기통 버튼 */}
                  <button
                    onClick={(e) => handleDelete(e, review)}
                    className="text-white/30 hover:text-red-400 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
                    title="리뷰 삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/30 text-xs text-center py-4">
            작성한 리뷰가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}