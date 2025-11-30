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
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

export default function BoxOfficePage() {
  const [boxOfficeMovies, setBoxOfficeMovies] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"boxOffice" | "rating">("boxOffice");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
              poster: movie.posterUrl || movie.poster || "/default-poster.png",
              posterUrl: movie.posterUrl || movie.poster,
              backdrop: movie.backdropUrl || movie.backdrop,
              tmdbId: movie.tmdbId ?? null,
              rating: movie.rating ?? null,
            };
          }

          return {
            ...item,
            movieNm: "정보 없음",
            poster: "/default-poster.png",
            posterUrl: "/default-poster.png",
            salesAcc: 0,
            openDt: "미상",
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
    fetchBoxOffice();
  }, []);

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
    id: movie.movieCd,
    fullMovie: movie,
  }));

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-10 md:mb-14">
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200">
              Weekly Box Office
            </h1>
            <p className="text-sm text-white/70">
              주간 박스오피스 데이터를 확인해보세요.
            </p>
          </div>
        </header>

        {/* Sort Buttons */}
        <section className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl text-white">TOP 5 랭킹</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("boxOffice")}
                  className={`px-6 py-2 rounded transition-all ${sortBy === "boxOffice"
                    ? "bg-yellow-300 text-[#064c4d]"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  흥행 수익
                </button>

                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-6 py-2 rounded transition-all ${sortBy === "rating"
                    ? "bg-yellow-300 text-[#064c4d]"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <Star className="w-4 h-4 inline mr-2" />
                  평점
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#00494A]/50 backdrop-blur-sm border border-white/10 rounded-lg pl-8 pr-8 pt-8">

              {loading ? (
                <p className="text-center text-white/70">불러오는 중...</p>
              ) : (
                <ResponsiveContainer width="100%" height={500}>
                  <>
                    <style>
                      {`
                        .recharts-surface,
                        .recharts-surface * {
                          outline: none !important;
                          stroke: none !important;
                        }
                      `}
                    </style>

                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

                      <XAxis
                        dataKey="name"
                        stroke="none"
                        tick={{ fill: "#FFFFFF80", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={120}
                      />

                      <YAxis
                        stroke="none"
                        tick={{ fill: "#FFFFFF80" }}
                        tickFormatter={(value) =>
                          sortBy === "boxOffice"
                            ? `${(value / 1000000).toFixed(0)}M`
                            : (value / 10000000).toFixed(1)
                        }
                      />

                      <Tooltip
                        position={{ y: 299 }}
                        offset={20}
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "8px",
                          color: "#FFFFFF",
                          backdropFilter: "blur(4px)",
                        }}
                        itemStyle={{ color: "#FFFFFF" }}
                        labelStyle={{ color: "#FDE047" }}
                        formatter={(value: any) =>
                          sortBy === "boxOffice"
                            ? [`$${(value / 1000000).toFixed(2)}M`, "흥행 수익"]
                            : [(value / 10000000).toFixed(1), "평점"]
                        }
                      />

                      <Bar dataKey="value" radius={[8, 8, 0, 0]} stroke="none">
                        {chartData.map((_, index) => (
                          <Cell key={index} fill="#2BEDF0" opacity={0.9} stroke="none" />
                        ))}
                      </Bar>
                    </BarChart>
                  </>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Movie Cards */}
        <section className="px-6 pb-16">
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
                    className={`related-card group ${canNavigate ? "cursor-pointer" : "cursor-default opacity-50"
                      }`}
                  >
                    <div className="related-poster relative">
                      <ImageWithFallback
                        src={movie.posterUrl || movie.poster}
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