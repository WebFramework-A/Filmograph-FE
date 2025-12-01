import { useEffect, useState, useCallback, useRef } from "react";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/data/firebaseConfig";
import { type Review } from "../../types/review";
import { deleteReview } from "../../services/review/reviewService";
import { useAuth } from "../../hooks/useAuth";
import ReviewForm from "./ReviewForm";
import "./styles/WatchProvidersSection.css";

interface Props {
  movie: { id: string; title: string };
}

// 개별 리뷰 아이템 컴포넌트 (유저 정보 Fetch 담당)
const ReviewItem = ({
  review,
  currentUser,
  onEdit,
  onDelete,
}: {
  review: Review;
  currentUser: any;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
}) => {
  // 유저 레벨 상태 관리
  const [userLevel, setUserLevel] = useState<any>(null);

  useEffect(() => {
    // userId가 없으면 스킵
    // 익명이어도 레벨은 출력
    if (!review.userId) return;

    const fetchUserInfo = async () => {
      try {
        // users 컬렉션에서 해당 유저의 문서 가져오기
        const userDocRef = doc(db, "users", review.userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // DB에 저장된 level 정보가 있으면 가져옴
          if (userData.level) {
            setUserLevel(userData.level);
          }
        }
      } catch (error) {
        console.error("유저 정보 로드 실패:", error);
      }
    };

    fetchUserInfo();
  }, [review.userId]);

  return (
    <div className="bg-black/20 p-5 rounded-lg border border-white/5 relative group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {/* 프로필 사진 */}
          <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden shrink-0">
            {!review.isAnonymous && review.userInfo?.photoURL && (
              <img
                src={review.userInfo.photoURL}
                alt="user"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/*익명일 경우 프로필 사진 표시 안함*/}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">
                {review.isAnonymous
                  ? "익명"
                  : review.userInfo?.nickname || "익명"}
              </p>

              {/* 레벨 배지 표시 (저장된 레벨 정보가 있을 때만) */}
              {userLevel && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center justify-center"
                  style={{
                    backgroundColor: userLevel.color || "#E0E0E0", // 기본값 회색
                    color: "black", // 텍스트 검은색 고정
                    height: "fit-content"
                  }}
                >
                  Lv.{userLevel.level} {userLevel.name}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40">
              {review.createdAt?.seconds
                ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>

        {/* 오른쪽: 별점 및 버튼 그룹 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex text-yellow-400 font-bold items-center gap-1">
            <span>★</span>
            <span>{review.rating}</span>
          </div>

          {/* 본인일 때만 수정/삭제 버튼 표시 */}
          {currentUser && currentUser.uid === review.userId && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(review)}
                className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white"
              >
                수정
              </button>
              <button
                onClick={() => onDelete(review)}
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
  );
};

export default function ReviewsSection({ movie }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
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
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Review)
      );
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

  const handleDelete = async (review: Review) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteReview(
        review.id,
        review.movieId,
        review.userId,
        review.rating
      );
      alert("삭제되었습니다.");
      fetchReviews();
    } catch (error) {
      console.error("삭제 실패", error);
      alert("삭제 실패");
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section className="providers-wrapper overflow-hidden">
      <div className="max-w-7xl mx-auto py-12">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          관람객 리뷰{" "}
          <span className="text-white/60 text-lg">({reviews.length})</span>
        </h2>

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
            {/* 반복문 내부를 ReviewItem 컴포넌트로 교체 */}
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                currentUser={user}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-black/10 rounded-lg text-white/50">
            첫 리뷰를 남겨보세요!
          </div>
        )}
      </div>
    </section>
  );
}