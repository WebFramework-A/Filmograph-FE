import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { type Review } from "../features/review/types/review";

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

const processGenreData = (movies: WishlistItem[]) => {
  const COLORS = ["#FF5252", "#5B8FF9", "#F6BD16", "#E040FB", "#4FC3F7", "#66BB6A"];
  const genreCount: { [key: string]: number } = {};
  let totalGenres = 0;

  movies.forEach((movie) => {
    const genres = movie.genres || [];
    genres.forEach((genre) => {
      if (genre) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
        totalGenres++;
      }
    });
  });

  if (totalGenres === 0) return [];

  const sortedGenres = Object.entries(genreCount)
    .map(([name, count]) => ({
      name,
      value: (count / totalGenres) * 100,
      count,
    }))
    .sort((a, b) => b.value - a.value);

  return sortedGenres.slice(0, 5).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));
};

export default function MyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [userInfo, setUserInfo] = useState<any>(null);
  const [likes, setLikes] = useState<WishlistItem[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  // Status 컴포넌트용 데이터
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    reviewCount: 0,
    ratingCount: 0,
    avgRating: 0
  });

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const newGenreData = processGenreData(likes);
    setGenreData(newGenreData);
  }, [likes]);

  const fetchMyData = useCallback(async (uid: string) => {
    try {
      // 유저 정보 가져오기
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) setUserInfo(userDoc.data());

      // 찜 목록 가져오기
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      const wishlistSnap = await getDocs(wishlistRef);

      // 리뷰 개수 가져오기 
      let myReviews: Review[] = [];
      let totalRatingCount = 0;  //별점 개수
      let totalReviewCount = 0;   //리뷰 개수
      let totalRatingSum = 0;
      try {
        const reviewsRef = collection(db, "reviews");

        // 전체 개수 및 평점 합계 계산
        const allMyReviewsQuery = query(reviewsRef, where("userId", "==", uid));
        const allSnap = await getDocs(allMyReviewsQuery);

        totalRatingCount = allSnap.size; // 전체 문서 개수 = 평가 횟수

        allSnap.forEach(doc => {
          const data = doc.data();
          totalRatingSum += (data.rating || 0);

          // 내용이 있고 공백이 아니면 '리뷰'로 카운트
          if (data.content && data.content.trim().length > 0) {
            totalReviewCount++;
          }
        });

        // 최근 3개만 가져오기 (Status 컴포넌트 표시용)
        // Firestore 복합 색인(Index) 에러가 뜨면 콘솔의 링크를 클릭해서 인덱스를 생성해야 합니다.
        const recentQuery = query(
          reviewsRef,
          where("userId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const recentSnap = await getDocs(recentQuery);

        myReviews = recentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));

      }
      catch (error) {
        console.error("리뷰 로딩 중 에러 (인덱스 필요할 수 있음):", error);
      }

      setRecentReviews(myReviews);

      // 통계 업데이트
      setStats({
        reviewCount: totalReviewCount,  //리뷰 개수
        ratingCount: totalRatingCount, // 별점 개수
        avgRating: totalReviewCount > 0 ? (totalRatingSum / totalRatingCount) : 0
      });

      // 영화 상세 정보 매핑
      const promises = wishlistSnap.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const movieId = itemData.movieId || itemDoc.id;

        const movieDocRef = doc(db, "movies", movieId);
        const movieSnap = await getDoc(movieDocRef);
        const movieData = movieSnap.exists() ? (movieSnap.data() as any) : null;
        const rawGenre = movieData?.genre || movieData?.genres;

        let finalGenres: string[] = [];

        if (typeof rawGenre === 'string') {
          finalGenres = rawGenre.split(',').map((g: string) => g.trim()).filter(Boolean);
        }
        else if (Array.isArray(rawGenre)) {
          finalGenres = rawGenre.map((g: any) =>
            typeof g === 'string' ? g : g.name
          ).filter(Boolean);
        }

        return {
          id: movieId,
          title: movieData?.title || movieData?.movieNm || "제목 없음",
          posterUrl: movieData?.posterUrl || null,
          addedAt: itemData.addedAt,
          genres: finalGenres,
        } as WishlistItem;
      });

      const resolvedList = await Promise.all(promises);

      resolvedList.sort((a, b) => {
        const timeA = a.addedAt?.seconds || 0;
        const timeB = b.addedAt?.seconds || 0;
        return timeB - timeA;
      });

      setLikes(resolvedList);
    }
    catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyData(user.uid);
    }
  }, [user, fetchMyData]);

  if (loading || !userInfo) {
    return <div className="flex items-center justify-center h-screen bg-[#0d5a5a] text-white">로딩 중...</div>;
  }

  //리뷰 삭제 시 목록 새로고침하는 함수
  const handleReviewDeleted = () => {
    if (user) fetchMyData(user.uid); // 데이터 다시 불러오기
  };

  return (
    <div className="min-h-screen bg-[#0d5a5a] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
          <h1 className="text-4xl font-bold text-yellow-200">My Page</h1>
          <p className="text-sm text-white/70">나의 영화 취향과 활동을 확인하세요</p>
        </div>

        <Profile
          userInfo={userInfo}
          currentUser={user}
          reviewCount={stats.reviewCount}
          likeCount={likes.length}
        />

        {/* 통계 & 찜 목록 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 리뷰 목록 */}
          <Status
            status={stats}
            recentReviews={recentReviews}
            onReviewDeleted={handleReviewDeleted} // 여기서 함수 전달!
          />
          {/*찜 목록*/}
          <MyLikes likes={likes} setLikes={setLikes} />
        </div>

        {/* 차트 섹션 컴포넌트 */}
        <GenreChart genreData={genreData} />
      </div>
    </div>
  );
}