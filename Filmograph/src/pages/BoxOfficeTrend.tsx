import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, RefreshCw, AlertCircle } from "lucide-react";

import type { ChartDataPoint } from "../types/boxOfficeTrend";
import { save7DaysTrend } from "../services/movies/boxOfficeTrendSaver";

import { db } from "../services/data/firebaseConfig";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
const COLORS = [
  "#1DB954", // 남색
  "#FF4444", // 주황(다홍에 가까운 주황)
  "#33C9FF", // 하늘
  "#FFC400", // 노랑
  "#84f781", // 연두
  "#FF66C4", // 분홍
  "#9D4EDD", // 보라
  "#FF9F1C", // 주황
  "#2EC4B6", // 어두운 민트
  "#FEE440", // 밝은 노랑
  "#f4b973", // 주황
  "#5fbed4", // 하늘
  "#775e57", // 갈색
  "#f1f1f1", // 거의 흰색
  "#c0e1e8", // 옅은 하늘색
  "#0A55AF", // 진한 남색
  "#656e65", // 녹색
  "#000000", // 흰색
];

export default function BoxOfficeTrend() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [allMovies, setAllMovies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("-");

  const fetchFromFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, "boxOfficeTrend"));
      if (snap.empty) return;

      const sorted = snap.docs
        .map((d) => d.data())
        .sort((a: any, b: any) => Number(a.date) - Number(b.date));

      const chartData: ChartDataPoint[] = [];
      const movieSet = new Set<string>();

      sorted.forEach((day) => {
        const point: ChartDataPoint = {
          date: `${day.date.slice(4, 6)}/${day.date.slice(6, 8)}`,
          fullDate: day.date,
        };

        day.top10.forEach((m: any) => {
          point[m.movieNm] = m.rank;
          movieSet.add(m.movieNm);
        });

        chartData.push(point);
      });

      setData(chartData);
      setAllMovies(Array.from(movieSet));
    } catch (err) {
      console.error(err);
      setError("데이터 로드 중 오류가 발생했습니다.");
    }
  };

  const fetchLastSavedTime = async () => {
    try {
      const metaRef = doc(db, "system", "boxOfficeTrendMeta");
      const metaSnap = await getDoc(metaRef);

      if (metaSnap.exists()) {
        const isoTime = metaSnap.data().lastSavedAt;
        setLastUpdated(
          new Date(isoTime).toLocaleString("ko-KR", { hour12: false })
        );
      }
    } catch (err) {
      console.error("meta 로드 오류", err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchFromFirestore();
      await fetchLastSavedTime();
      setLoading(false);
    })();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const ordered = [...payload].sort((a, b) => a.value - b.value);
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg text-white">
          <p className="font-bold mb-2 border-b border-slate-600 pb-1">
            {label} 순위
          </p>

          <ul className="space-y-1 text-sm">
            {ordered.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-mono w-8 text-right font-bold">
                  {item.value}위
                </span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-6 pt-20">
      {/* Header 영역 */}
      <div className="max-w-6xl mx-auto mb-10">
        <header>
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200 flex items-center gap-3">
              Weekly Box Office Flow
            </h1>

            <p className="text-sm text-white/70 whitespace-nowrap">
              Firestore에 저장된 박스오피스 7일 기록을 보여줍니다.
            </p>
          </div>
        </header>

        {/* 새로고침 버튼 */}
        <div className="flex justify-end mt-2">
          <button
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-[#0b4747] hover:bg-yellow-400 rounded-md transition-colors border border-slate-700"
            onClick={async () => {
              setLoading(true);
              await save7DaysTrend();
              await fetchFromFirestore();
              await fetchLastSavedTime();
              setLoading(false);
            }}
            >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "로딩 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {/* 그래프 메인영역 */}
      <div className="max-w-6xl mx-auto px-2">
        {/* 현황 */}
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={12} /> {data[0]?.date} ~
            {data[data.length - 1]?.date} 까지의 일별 랭킹
          </span>
          <span className="text-sm text-slate-500">
            마지막 업데이트: {lastUpdated}
          </span>
        </div>

        {/* 에러처리 */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle />
            {error}
          </div>
        )}

        {/* 그래프 */}
        <div className="bg-black/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#444" }}
                />

                <YAxis
                  reversed={true}
                  domain={[1, 10]}
                  tickCount={10}
                  stroke="#666"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#444" }}
                  label={{
                    value: "Rank",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#666",
                  }}
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />

                {!loading &&
                  allMovies.map((movieName, index) => (
                    <Line
                      key={movieName}
                      type="monotone"
                      dataKey={movieName}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "#181818" }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      connectNulls={true}
                      animationDuration={1500}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 하단에 요약카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-10">
          {/* 오늘 1등 */}
          <div className="bg-black/20 p-6 rounded-lg border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium mb-2">
              최신 1위 영화
            </h3>
            <p className="text-2xl font-bold text-yellow-300 truncate">
              {data.length > 0
                ? Object.keys(data[data.length - 1]).find(
                    (key) => data[data.length - 1][key] === 1
                  ) || "-"
                : "-"}
            </p>
          </div>

          {/* Entry Count */}
          <div className="bg-black/20 p-6 rounded-lg border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium mb-2">
              랭킹 진입 영화 수
            </h3>
            <p className="text-2xl font-bold text-yellow-300">
              {allMovies.length}{" "}
              <span className="text-base text-slate-500 font-normal">편</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
