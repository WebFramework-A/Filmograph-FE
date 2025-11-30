import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../services/data/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import type { WishlistItem } from "../../pages/MyPage";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<WishlistItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchLikes(user.uid);
  }, [user, loading, navigate]);

  const fetchLikes = async (uid: string) => {
    try {
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      const wishlistSnap = await getDocs(wishlistRef);

      const promises = wishlistSnap.docs.map(async (itemDoc) => {
        const movieId = itemDoc.data().movieId || itemDoc.id;
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        const movieData = movieDoc.exists() ? movieDoc.data() : null;

        return {
          id: movieId,
          title: movieData?.title || movieData?.movieNm || "제목 없음",
          posterUrl: movieData?.posterUrl || null,
          addedAt: itemDoc.data().addedAt,
        } as WishlistItem;
      });

      const list = await Promise.all(promises);
      // 최신순 정렬
      list.sort(
        (a, b) => (b.addedAt?.seconds || 0) - (a.addedAt?.seconds || 0)
      );

      setLikes(list);
    } catch (error) {
      console.error("찜 목록 로딩 실패:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRemoveLike = async (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    if (!user || !confirm("삭제하시겠습니까?")) return;

    try {
      await deleteDoc(doc(db, "userWishlist", user.uid, "items", movieId));
      setLikes((prev) => prev.filter((item) => item.id !== movieId));
    } catch (error) {
      console.log(error);
      alert("삭제 실패");
    }
  };

  if (loading || isLoadingData)
    return <div className="text-white text-center pt-20">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex border-b border-white/20 pb-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-[#FFD700]"
          >
            ←
          </button>
          <h2 className="text-4xl font-bold text-yellow-200">
            찜한 영화 전체 목록
          </h2>
          <span className="text-xl text-white/60">({likes.length})</span>
        </div>

        {/* 전체 포스터 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {likes.map((movie) => (
            <div
              key={movie.id}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/detail/${movie.id}`)}
            >
              <div className="aspect-2/3 rounded-lg overflow-hidden bg-gray-800 shadow-lg border border-white/10 group-hover:border-[#FFD700] transition-all relative">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    No Image
                  </div>
                )}

                <button
                  onClick={(e) => handleRemoveLike(e, movie.id)}
                  className="absolute top-2 right-2 text-[#FFD700] hover:text-white bg-black/50 rounded-full p-1.5 transition-colors z-10"
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
              <p className="mt-2 text-center font-bold truncate text-white/90">
                {movie.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
