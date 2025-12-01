import { useNavigate } from "react-router-dom";
import type { WishlistItem } from "../../pages/MyPage";
import { db } from "../../services/data/firebaseConfig";
import { doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import { calculateUserLevel } from "../../utils/levelUtils";

interface Props {
  likes: WishlistItem[];
  setLikes: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
}

export default function MyLikes({ likes, setLikes }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRemoveLike = async (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      const docRef = doc(db, "userWishlist", user.uid, "items", movieId);
      await deleteDoc(docRef);

      //유저 정보 업데이트
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentReviewCount = userData.reviewCount || 0;
        // 현재 화면에 보이는 개수에서 1개를 뺌 (가장 정확함)
        const newLikeCount = Math.max(0, likes.length - 1);

        const newLevel = calculateUserLevel(currentReviewCount, newLikeCount);

        await updateDoc(userRef, {
          likeCount: newLikeCount,
          level: {
            level: newLevel.level,
            name: newLevel.name,
            color: newLevel.color
          }
        });
      }

      //상태 업데이트
      setLikes((prev) => prev.filter((item) => item.id !== movieId));
    } catch (error) {
      console.error("찜 삭제 실패:", error);
      alert("찜 삭제 중 오류가 발생했습니다. (권한 문제일 수 있습니다)");
    }
  };

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-white/5 shadow-md flex flex-col h-full relative transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2">
          {/*책갈피 아이콘*/}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-yellow-200"
          >
            <path
              fillRule="evenodd"
              d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-yellow-200">찜한 영화</div>
          <span className="text-sm text-white/60 font-normal">
            ({likes.length})
          </span>
        </h3>

        {/* 3개 이상일 때 '모두 보기' 버튼 표시 -> 클릭 시 페이지 이동 */}
        {likes.length > 2 && (
          <button
            onClick={() => navigate("/my-likes")} // 찜 목록 페이지로 이동
            className="text-xs text-white/70 hover:text-white bg-white/10 px-2 py-1 rounded transition-colors"
          >
            모두 보기 ▶
          </button>
        )}
      </div>

      {likes.length > 0 ? (
        <div className="flex-1">
          {/* 항상 최신 2개만 미리보기로 표시 */}
          <div className="grid grid-cols-2 gap-4">
            {/* [수정] 여기서 최신 2개만 잘라서 출력 */}
            {likes.slice(0, 2).map((movie) => (
              <div
                key={movie.id}
                className="relative group cursor-pointer"
                onClick={() => navigate(`/detail/${movie.id}`)} // 상세 페이지 이동
              >
                <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800 shadow-lg border border-white/10 group-hover:border-[#FFD700] transition-all relative">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                      No Poster
                    </div>
                  )}

                  {/* 삭제 버튼 (책갈피) */}
                  <button
                    onClick={(e) => handleRemoveLike(e, movie.id)}
                    className="absolute top-2 right-2 text-[#FFD700] hover:text-white transition-colors z-10 bg-black/50 rounded-full p-1"
                    title="찜 삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-center">
                  <h4 className="text-sm font-bold truncate px-1 text-white/90">
                    {movie.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm py-8">
          아직 찜한 영화가 없습니다.
        </div>
      )}
    </div>
  );
}