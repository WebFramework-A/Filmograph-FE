import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// 분리한 컴포넌트들 임포트
import Profile from "../components/MyPage/Profile";
import Status from "../components/MyPage/Status";
import MyLikes from "../components/MyPage/MyLikes";
import GenreChartSection from "../components/MyPage/GenreChart";

// 데이터 타입 정의 (하위 컴포넌트에서도 쓰일 수 있으므로 types 폴더로 빼는 것도 좋습니다)
export interface WishlistItem {
  id: string;
  title: string;
  posterUrl?: string;
  addedAt: any;
}

export interface GenreData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export default function MyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [userInfo, setUserInfo] = useState<any>(null);
  const [likes, setLikes] = useState<WishlistItem[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);

  // (임시) 통계 데이터
  const stats = {
    reviewCount: 12,
    ratingCount: 45,
    avgRating: 4.2,
  };

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // 데이터 로딩 트리거
  useEffect(() => {
    if (user) {
      fetchMyData(user.uid);
    }
  }, [user]);

  // 실제 데이터 가져오는 함수 (영화 정보 Join 포함)
  const fetchMyData = async (uid: string) => {
    try {
      //  유저 정보
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) setUserInfo(userDoc.data());

      // 찜 목록 + 영화 상세 정보 병합
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      const wishlistSnap = await getDocs(wishlistRef);

      const promises = wishlistSnap.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const movieId = itemData.movieId || itemDoc.id;

        // movies 컬렉션에서 제목, 포스터 조회
        const movieDocRef = doc(db, "movies", movieId);
        const movieSnap = await getDoc(movieDocRef);
        const movieData = movieSnap.exists() ? movieSnap.data() : null;

        return {
          id: movieId,
          title: movieData?.title || movieData?.movieNm || "제목 없음",
          posterUrl: movieData?.posterUrl || null,
          addedAt: itemData.addedAt,
        } as WishlistItem;
      });

      const resolvedList = await Promise.all(promises);

      // 최신순 정렬 (addedAt 기준)
      resolvedList.sort((a, b) => {
        const timeA = a.addedAt?.seconds || 0;
        const timeB = b.addedAt?.seconds || 0;
        return timeB - timeA;
      });

      setLikes(resolvedList);

      // !(임시) 차트 데이터 (임시)
      setGenreData([
        { name: "스릴러", value: 35, color: "#4FC3F7" },
        { name: "드라마", value: 20, color: "#81C784" },
        { name: "로맨스", value: 5, color: "#FFD54F" },
        { name: "액션", value: 25, color: "#E0E0E0" },
        { name: "SF", value: 10, color: "#90A4AE" },
        { name: "애니메이션", value: 3, color: "#A1887F" },
      ]);

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  if (loading || !userInfo) {
    return <div className="flex items-center justify-center h-screen bg-[#0d5a5a] text-white">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d5a5a] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
          <h1 className="text-4xl font-bold text-yellow-200">My Page</h1>
          <p className="text-sm text-white/70">나의 영화 취향과 활동을 확인하세요</p>
        </div>

        {/* 프로필 섹션 컴포넌트 */}
        <Profile userInfo={userInfo} currentUser={user} />

        {/* 통계 & 찜 목록 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Status status={stats} />
          <MyLikes likes={likes} />
        </div>

        {/* 차트 섹션 컴포넌트 */}
        <GenreChartSection genreData={genreData} />
      </div>
    </div>
  );
}