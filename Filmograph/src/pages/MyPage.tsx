import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// 분리한 컴포넌트들 임포트
import Profile from "../components/MyPage/Profile";
import Status from "../components/MyPage/Status";
import MyLikes from "../components/MyPage/MyLikes";
import GenreChart from "../components/MyPage/GenreChart";

import { calculateUserLevel, getNextLevelProgress, LevelDefinition } from "../utils/levelUtils";

// 데이터 타입 정의 (하위 컴포넌트에서도 쓰일 수 있으므로 types 폴더로 빼는 것도 좋습니다)
export interface WishlistItem {
  id: string;
  title: string;
  posterUrl?: string;
  addedAt: any;
  genres?: string[]; // 장르 분석을 위해 genres 필드 추가 (항상 문자열 배열로 관리)
}

export interface GenreData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

const processGenreData = (movies: WishlistItem[]) => {
  // 장르 차트 색깔 설정
  const COLORS = ["#FF5252", "#5B8FF9", "#F6BD16", "#E040FB", "#4FC3F7", "#66BB6A"];
  const genreCount: { [key: string]: number } = {};
  let totalGenres = 0;

  // 모든 영화의 장르 카운트
  movies.forEach((movie) => {
    // movie.genres가 배열이라고 가정 (데이터 구조에 따라 수정 필요)
    const genres = movie.genres || [];

    genres.forEach((genre) => {
      // 문자열 혹은 객체 처리
      if (genre) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
        totalGenres++;
      }
    });
  });

  if (totalGenres === 0) return [];

  //  배열로 변환 및 정렬 (상위 비중 높은 순)
  const sortedGenres = Object.entries(genreCount)
    .map(([name, count]) => ({
      name,
      value: (count / totalGenres) * 100, // 퍼센트 계산
      count, // (필요하면 원본 개수도 저장)
    }))
    .sort((a, b) => b.value - a.value); // 높은 순 정렬

  //  상위 5개 자르고 나머지는 '기타'로 합치기 (여기선 단순히 상위 5개만 추출)
  return sortedGenres.slice(0, 5).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length], // 색상 순환 할당
  }));
};

export default function MyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [userInfo, setUserInfo] = useState<any>(null);  //프로필
  const [likes, setLikes] = useState<WishlistItem[]>([]); //찜 목록
  const [genreData, setGenreData] = useState<GenreData[]>([]);  //장르차트
  const [reviewCount, setReviewCount] = useState(0);  //리뷰
  //레벨관련
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition | null>(null);
  const [levelProgress, setLevelProgress] = useState<any>(null);

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

  useEffect(() => {
    // likes가 빈 배열이어도 processGenreData가 잘 처리하므로 안전함
    const newGenreData = processGenreData(likes);
    setGenreData(newGenreData);
  }, [likes]);

  // 실제 데이터 가져오는 함수 (영화 정보 Join 포함)
  const fetchMyData = useCallback(async (uid: string) => {
    try {
      // 유저 정보 가져오기
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) setUserInfo(userDoc.data());


      // 찜 목록 + 영화 상세 정보 병합
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      const wishlistSnap = await getDocs(wishlistRef);

      /*리뷰 목록 틀 잡기
      const reviewsQuery = query(collection(db, "reviews"), where("userId", "==", uid));
      const reviewsSnapshot = await getCountFromServer(reviewsQuery);
      const myReviewCount = reviewsSnapshot.data().count;

      setReviewCount(myReviewCount);
      */

      /* 레벨 계산 (찜 개수는 wishlistSnap.size 사용) --- */
      const myLikeCount = wishlistSnap.size;

      const level = calculateUserLevel(myReviewCount, myLikeCount);
      const progress = getNextLevelProgress(level.level, myReviewCount, myLikeCount);

      setCurrentLevel(level);
      setLevelProgress(progress);

      const promises = wishlistSnap.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const movieId = itemData.movieId || itemDoc.id;

        // movies 컬렉션에서 제목, 포스터, 장르 조회
        const movieDocRef = doc(db, "movies", movieId);
        const movieSnap = await getDoc(movieDocRef);

        // movie 장르 데이터 받아오기
        const movieData = movieSnap.exists() ? (movieSnap.data() as any) : null;

        const rawGenre = movieData?.genre || movieData?.genres;

        // 데이터 정제
        let finalGenres: string[] = [];

        if (typeof rawGenre === 'string') {
          // "액션, 스릴러" 처럼 문자열인 경우 -> 콤마로 잘라서 배열화
          finalGenres = rawGenre.split(',').map((g: string) => g.trim()).filter(Boolean);
        }
        else if (Array.isArray(rawGenre)) {
          // ["액션", "스릴러"] 또는 [{name:"액션"}] 배열인 경우
          finalGenres = rawGenre.map((g: any) =>
            typeof g === 'string' ? g : g.name
          ).filter(Boolean);
        }

        return {
          id: movieId,
          title: movieData?.title || movieData?.movieNm || "제목 없음",
          posterUrl: movieData?.posterUrl || null,
          addedAt: itemData.addedAt,
          genres: finalGenres, // 컴포넌트 내부에서는 항상 배열로 사용
        } as WishlistItem;
      });

      const resolvedList = await Promise.all(promises);

      // 최신순 정렬 (addedAt 기준)
      resolvedList.sort((a, b) => {
        const timeA = a.addedAt?.seconds || 0;
        const timeB = b.addedAt?.seconds || 0;
        return timeB - timeA;
      });

      // 찜 목록 상태 업데이트
      setLikes(resolvedList);
    }
    catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  }, []);

  // 데이터 로딩 트리거
  useEffect(() => {
    if (user) {
      fetchMyData(user.uid);
    }
  }, [user, fetchMyData]);

  // 찜 목록이 변하면(삭제 등) 레벨도 다시 계산해야 함 (간단한 동기화)
  useEffect(() => {
    if (currentLevel) { // 초기 로딩 이후에만
      const newLevel = calculateUserLevel(reviewCount, likes.length);
      const newProgress = getNextLevelProgress(newLevel.level, reviewCount, likes.length);

      // 레벨이나 진척도가 바뀌었을 때만 업데이트 (불필요한 렌더링 방지)
      if (newLevel.level !== currentLevel.level || JSON.stringify(newProgress) !== JSON.stringify(levelProgress)) {
        setCurrentLevel(newLevel);
        setLevelProgress(newProgress);
      }
    }
  }, [likes.length, reviewCount]);


  if (loading || !userInfo || !currentLevel) {
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
          {/* setLikes를 전달하여 하위 컴포넌트에서 찜 해제 시 리스트 즉시 업데이트 */}
          <MyLikes likes={likes} setLikes={setLikes} />
        </div>

        {/* 차트 섹션 컴포넌트 */}
        <GenreChart genreData={genreData} />
      </div>
    </div>
  );
}