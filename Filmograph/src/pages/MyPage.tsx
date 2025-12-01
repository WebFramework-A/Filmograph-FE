import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/data/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { type Review } from "../types/review";
import { calculateUserLevel } from "../utils/levelUtils";

// 분리한 컴포넌트들 임포트
import Profile from "../components/MyPage/Profile";
import Status from "../components/MyPage/MyReviews";
import MyLikes from "../components/MyPage/MyLikes";
import GenreChart from "../components/MyPage/GenreChart";

// 데이터 타입 정의
export interface WishlistItem {
  id: string;
  title: string;
  posterUrl?: string;
  addedAt: any;
  genres?: string[];
}

export interface GenreData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

// 장르 데이터 처리 함수
const processGenreData = (movies: WishlistItem[]) => {

  const genreCounts: { [key: string]: number } = {};
  movies.forEach((movie) => {
    movie.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  const entries = Object.entries(genreCounts);
  const totalGenres = entries.length;

  return entries
    .map(([name, value], index) => ({
      name,
      value,
      // 장르 개수(totalGenres)만큼 360도 색상환을 쪼개서 색상 자동 생성
      // HSL(색상Hue, 채도Saturation, 명도Lightness)
      color: `hsl(${(index * 360) / totalGenres}, 70%, 60%)`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
};

export default function MyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [myReviews, setMyReviews] = useState<Review[]>([]);

  const [stats, setStats] = useState({
    reviewCount: 0,
    ratingCount: 0,
    avgRating: 0,
  });
  const [likes, setLikes] = useState<WishlistItem[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);

  // 내 정보 및 데이터 가져오기
  const fetchMyData = useCallback(async (uid: string) => {
    try {
      // 1. 유저 정보 가져오기
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      setUserInfo(userData);

      // 내 리뷰 가져오기 (평점만 남긴 것 포함)
      // q 변수를 정의하고 아래 getDocs(q)에서 사용해야 정렬이 됩니다.
      const reviewsQ = query(
        collection(db, "reviews"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const reviewsSnapshot = await getDocs(reviewsQ);

      const reviewsData = reviewsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Review)
      );

      setMyReviews(reviewsData);

      // 통계 계산
      const totalRatingCount = reviewsData.length;
      const realReviewCount = reviewsData.filter(
        (r) => r.content && r.content.trim().length > 0
      ).length;

      const totalRating = reviewsData.reduce((sum, r) => sum + r.rating, 0);
      const avg = reviewsData.length > 0 ? totalRating / reviewsData.length : 0;

      setStats({
        reviewCount: realReviewCount,
        ratingCount: totalRatingCount,
        avgRating: parseFloat(avg.toFixed(1)),
      });

      // 찜 목록 가져오기 (최신순 정렬)
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      // 정렬 쿼리 생성
      const wishlistQuery = query(wishlistRef, orderBy("createdAt", "desc"));

      // wishlistQuery 사용
      const wishlistSnap = await getDocs(wishlistQuery);

      const promises = wishlistSnap.docs.map(async (itemDoc) => {
        const movieId = itemDoc.data().movieId || itemDoc.id;
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        const movieData = movieDoc.exists() ? movieDoc.data() : null;

        if (!movieData) return null;

        return {
          id: movieId,
          title: movieData.title,
          posterUrl: movieData.posterUrl,
          addedAt: itemDoc.data().createdAt,
          genres: movieData.genre || [],
        } as WishlistItem;
      });

      const likesData = (await Promise.all(promises)).filter(
        (item) => item !== null
      ) as WishlistItem[];

      setLikes(likesData);
      setGenreData(processGenreData(likesData));

      // 데이터 동기화
      const realLikeCount = likesData.length;
      if (
        userData &&
        (userData.reviewCount !== realReviewCount || userData.likeCount !== realLikeCount)
      ) {
        console.log("데이터 동기화 중...");
        const correctLevel = calculateUserLevel(realReviewCount, realLikeCount);

        await updateDoc(userDocRef, {
          reviewCount: realReviewCount,
          likeCount: realLikeCount,
          level: {
            level: correctLevel.level,
            name: correctLevel.name,
            color: correctLevel.color
          }
        });

        setUserInfo({
          ...userData,
          reviewCount: realReviewCount,
          likeCount: realLikeCount,
          level: correctLevel
        });
      }

    } catch (error) {
      console.error("마이페이지 데이터 로드 실패:", error);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchMyData(user.uid);
    }
  }, [user, loading, navigate, fetchMyData]);

  if (loading || !userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b4747] text-white">
        로딩 중...
      </div>
    );
  }

  //리뷰 삭제 시 목록 새로고침하는 함수
  const handleReviewDeleted = () => {
    if (user) fetchMyData(user.uid); // 데이터 다시 불러오기
  };

  {/*출력 페이지*/ }
  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/*헤더*/}
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
          <h1 className="text-4xl font-bold text-yellow-200">My Page</h1>
          <p className="text-sm text-white/70">
            나의 영화 취향과 활동을 확인하세요.
          </p>
        </div>

        {/*프로필 섹션*/}
        <Profile
          userInfo={userInfo}
          currentUser={user}
          reviewCount={stats.reviewCount}
          likeCount={likes.length}
        />

        {/* 통계 & 찜 목록 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 왼쪽 */}
          {/* 최근 리뷰 목록 (slice 제거하고 원본 전달) */}
          <Status
            status={stats}
            recentReviews={myReviews}
            onReviewDeleted={handleReviewDeleted}
          />

          {/* 오른쪽 */}
          {/* 최근 찜 목록 (slice 제거하고 원본 전달) */}
          <MyLikes likes={likes} setLikes={setLikes} />
        </div>

        {/*장르 차트*/}
        <div className="mb-12">
          <GenreChart genreData={genreData} />
        </div>
      </div>
    </div>
  );
}