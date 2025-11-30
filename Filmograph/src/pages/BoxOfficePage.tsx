import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { DollarSign, Star } from "lucide-react";
import { ImageWithFallback } from "../components/DetailPage/ImageWithFallback";

import { db } from "../services/data/firebaseConfig";
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc } from "firebase/firestore";
import { saveMovie } from "../services/data/movieService";
import { fetchMovieDetail } from "../services/movies/movieAPI";
import { countKobisCall } from "../services/data/kobisUsage";

const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY;

// 날짜 계산
const getYmd = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

export default function BoxOfficePage() {
  const [boxOfficeMovies, setBoxOfficeMovies] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"boxOffice" | "rating">("boxOffice");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 자동 저장
  const saveTodayBoxOfficeOnce = async () => {
    try {
      const today = getYmd();

      const ref = doc(db, "system", "boxOfficeLastUpdate");
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().lastUpdate === today) return;

      const BO_URL =
        "https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";

      await countKobisCall();
      const res = await fetch(`${BO_URL}?key=${KOBIS_KEY}&targetDt=${today}`);
      const data = await res.json();

      const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
      const top10 = list.slice(0, 10);

      for (const item of top10) {
        const movieCd = item.movieCd;

        await countKobisCall();
        const detail = await fetchMovieDetail(movieCd);
        if (!detail) continue;

        await saveMovie(detail);

        await setDoc(doc(db, "boxOffice", movieCd), {
          rank: Number(item.rank),
          rankInten: Number(item.rankInten),
          movieCd,
          movieNm: item.movieNm,
          openDt: detail.openDt || item.openDt || null,
          salesAcc: Number(item.salesAcc || 0),
          poster: detail.poster || null,
          updatedAt: new Date().toISOString(),
        });

        await new Promise((r) => setTimeout(r, 120));
      }

      await setDoc(ref, {
        lastUpdate: today,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("박스오피스 저장 중 오류:", e);
    }
  };

  // Firestore 데이터 가져오기
  const fetchBoxOffice = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "boxOffice"), orderBy("rank", "asc"));
      const snap = await getDocs(q);
      const rawList = snap.docs.map((d) => d.data());

      const joined = await Promise.all(
        rawList.map(async (item) => {
          const movieSnap = await getDoc(doc(db, "movies", item.movieCd));

          if (movieSnap.exists()) {
            const movie = movieSnap.data();

            return {
              ...item,
              ...movie,
              posterUrl: movie.posterUrl || movie.poster,
              tmdbId: movie.tmdbId ?? null,
              rating: movie.rating ?? null,
            };
          }

          return {
            ...item,
            posterUrl: "/default-poster.png",
            rating: null,
            tmdbId: null,
          };
        })
      );

      setBoxOfficeMovies(joined);
    } catch (err) {
      console.error("박스오피스 로드 오류:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await saveTodayBoxOfficeOnce();
      await fetchBoxOffice();
    })();
  }, []);

  // 정렬 
  const topMovies = [...boxOfficeMovies]
    .sort((a, b) =>
      sortBy === "boxOffice"
        ? b.salesAcc - a.salesAcc
        : (b.rating || 0) - (a.rating || 0)
    )
    .slice(0, 10);

  const chartData = topMovies.map((movie) => ({
    name: movie.movieNm,
    value:
      sortBy === "boxOffice"
        ? movie.salesAcc
        : (movie.rating || 0) * 10000000,

    rawSales: movie.salesAcc,
    rawRating: movie.rating,

    id: movie.movieCd,
    fullMovie: movie,
  }));

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">

        {/* 헤더 */}
        <header className="mb-14">
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200">
              Daily Box Office
            </h1>
            <p className="text-sm text-white/70">일간 박스오피스 데이터를 확인해보세요.</p>
          </div>
        </header>

        {/* 정렬 버튼 */}
        <section className="px-6 mb-12">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h2 className="text-3xl text-white">TOP 5 랭킹</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("boxOffice")}
                className={`px-6 py-2 rounded transition-all ${
                  sortBy === "boxOffice"
                    ? "bg-yellow-300 text-[#064c4d]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                흥행 수익
              </button>

              <button
                onClick={() => setSortBy("rating")}
                className={`px-6 py-2 rounded transition-all ${
                  sortBy === "rating"
                    ? "bg-yellow-300 text-[#064c4d]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                평점
              </button>
            </div>
          </div>
        </section>

        {/* 차트 */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-8 relative">

            {loading && (
              <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            )}

            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

                <XAxis
                  dataKey="name"
                  stroke="none"
                  tick={{ fill: "#888", fontSize: 12  }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  
                />

                <YAxis
                  stroke="none"
                  tick={{ fill: "#888" }}
                  tickFormatter={(value) =>
                    sortBy === "boxOffice"
                      ? `${(value / 1000000).toFixed(0)}M`
                      : (value / 10000000).toFixed(1)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  labelStyle={{ color: "#FDE047" }}
                  formatter={(_value, _name, props: any) => {
                    const rawSales = props.payload.rawSales;
                    const rawRating = props.payload.rawRating;

                    if (sortBy === "boxOffice") {
                      return [
                        `$${(rawSales / 1_000_000).toFixed(0)}M`,
                        "흥행 수익",
                      ];
                    } else {
                      return [
                        rawRating ? rawRating.toFixed(1) : "N/A",
                        "평점"
                      ];
                    }
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill="#2EC4B6" opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 카드 리스트 */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl mb-8 text-yellow-300">전체 목록</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {topMovies.slice(0, 5).map((movie, index) => {
                const canNavigate = movie.tmdbId && movie.rating;

                return (
                  <motion.div
                    key={movie.movieCd}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    onClick={() => {
                      if (canNavigate) navigate(`/detail/${movie.movieCd}`);
                    }}
                    className={`related-card group ${
                      canNavigate ? "cursor-pointer" : "cursor-default opacity-50"
                    }`}
                  >
                    <div className="related-poster relative">
                      <ImageWithFallback
                        src={movie.posterUrl}
                        alt={movie.movieNm}
                        className="related-img"
                      />
                      {canNavigate && <div className="related-hover"></div>}
                      {canNavigate && <div className="related-go">상세페이지 →</div>}
                    </div>

                    <h3 className="related-name">{movie.movieNm}</h3>

                    <div className="related-info">
                      <div className="related-rating">
                        <Star className="star-icon" />
                        <span>
                          {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                      <span className="related-separator">·</span>
                      <span className="related-year">
                        {movie.openDt?.slice(0, 4) ?? "?"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
