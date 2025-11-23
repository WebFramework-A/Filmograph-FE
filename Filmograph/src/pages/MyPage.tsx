import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 차트 데이터 타입
interface GenreData {
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
  const [likes, setLikes] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);

  // (임시) 통계 데이터 - 추후 reviews 컬렉션 연동 시 실제 값으로 대체 가능
  const stats = {
    reviewCount: 12,
    ratingCount: 45,
    avgRating: 4.2,
  };

  // 로그인 체크 및 데이터 로딩
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login"); // 비로그인 시 로그인 페이지로 이동
      return;
    }

    if (user) {
      fetchMyData(user.uid);
    }
  }, [user, loading, navigate]);

  // 데이터 가져오기 함수
  const fetchMyData = async (uid: string) => {
    try {
      //유저 정보 가져오기
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      }

      // 찜한 영화 목록 가져오기
      // userWishlist/{uid}/items 경로의 모든 문서 가져오기
      const wishlistRef = collection(db, "userWishlist", uid, "items");
      const wishlistSnap = await getDocs(wishlistRef);

      const wishlist = wishlistSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setLikes(wishlist);

      //(임시) 장르 차트 데이터
      // 실제로는 wishlist나 reviews의 영화 장르를 분석해서 카운트해야 합니다.
      const dummyGenres = [
        { name: "스릴러", value: 35, color: "#4FC3F7" },
        { name: "드라마", value: 20, color: "#81C784" },
        { name: "로맨스", value: 5, color: "#FFD54F" },
        { name: "액션", value: 25, color: "#E0E0E0" },
        { name: "SF", value: 10, color: "#90A4AE" },
        { name: "애니메이션", value: 3, color: "#A1887F" },
      ];
      setGenreData(dummyGenres);

    } catch (error) {
      console.error("마이페이지 데이터 로딩 실패:", error);
    }
  };

  // 로딩 중일 때 표시
  if (loading || !userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d5a5a] text-white">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d5a5a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
          <h1 className="text-4xl font-bold text-[#FFD700]">My Page</h1>
          <p className="text-sm text-white/70">나의 영화 취향과 활동을 확인하세요</p>
        </div>

        {/* 프로필 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex gap-6 items-center">
            <img
              src={userInfo.photoURL || user?.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-[#FFD700] object-cover"
            />
            <div>
              <h2 className="text-3xl font-bold mb-1">{userInfo.nickname || user?.displayName || "영화 팬"}</h2>
              <p className="text-[#FFD700] mb-2">@{user?.email?.split('@')[0]}</p>
              <span className="bg-[#F0E68C] text-black px-3 py-1 rounded-full text-sm font-bold">
                Level 1. 비기너
              </span>
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-lg text-sm space-y-3 backdrop-blur-sm border border-white/5">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/70">이메일</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/70">가입일</span>
              {/* 가입일이 Timestamp인 경우 Date 변환 필요 */}
              <span>{userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">상태</span>
              <span className="text-green-400">활동 중</span>
            </div>
          </div>
        </div>

        {/* 2. 통계 & 찜 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 활동 통계 */}
          <div className="bg-black/20 p-6 rounded-lg border border-white/5">
            <h3 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
              활동 통계
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>작성한 리뷰</span>
                <span className="text-2xl font-bold">{stats.reviewCount}</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-[#FFD700] h-full" style={{ width: '30%' }}></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span>평균 평점</span>
                <span className="text-2xl font-bold text-[#4FC3F7]">{stats.avgRating}</span>
              </div>
            </div>
          </div>

          {/* My Likes (찜 목록) */}
          <div className="bg-black/20 p-6 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2">
                <span>♥</span> 찜한 영화 ({likes.length})
              </h3>
            </div>

            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
              {likes.length > 0 ? (
                likes.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10 transition cursor-pointer">
                    <span className="truncate max-w-[200px]">
                      {item.movieTitle || `영화 ID: ${item.movieId || item.id}`}
                    </span>
                    <span className="text-xs text-white/50">
                      {item.addedAt ? new Date(item.addedAt.toDate()).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-center py-8">아직 찜한 영화가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 장르 차트 섹션 */}
        <div className="bg-black/20 p-8 rounded-lg border border-white/5">
          <h3 className="text-2xl font-bold text-[#FFD700] mb-2">취향 분석</h3>
          <p className="text-sm text-white/70 mb-8">내가 찜한 영화들의 장르 분포입니다</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* 파이 차트 */}
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 범례 및 분석 텍스트 */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {genreData.map((genre) => (
                  <div key={genre.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }}></span>
                    <span className="text-white/80">{genre.name}</span>
                    <span className="ml-auto font-bold">{genre.value}%</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 p-4 rounded-lg text-sm">
                <p className="mb-2">💡 <strong>분석 결과</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-white/80">
                  <li>가장 선호하는 장르는 <span className="text-[#4FC3F7] font-bold">스릴러</span>입니다.</li>
                  <li>다양한 장르를 골고루 즐기시는 편이네요!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}