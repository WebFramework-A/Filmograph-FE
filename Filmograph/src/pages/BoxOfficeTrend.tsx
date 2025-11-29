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
import { Calendar, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import type { ChartDataPoint, DailyData } from "../types/boxOfficeTrend";
import { getPastDate } from "../utils/getPastDate";

const KOBIS_BASE_URL =
  "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";

const COLORS = [
  "#1DB954",
  "#FF4444",
  "#33C9FF",
  "#FFC400",
  "#FF66C4",
  "#9D4EDD",
  "#FF9F1C",
  "#2EC4B6",
  "#F15BB5",
  "#FEE440",
];

export default function BoxOfficeTrend() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [allMovies, setAllMovies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("-");

  // 데이터 가져오기
  const fetchBoxOfficeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 지난 7일간의 데이터 요청 (어제~7일전)
      const requests = [];
      const dateMap: {
        displayFmt: string;
        apiFmt: any;
      }[] = [];

      for (let i = 7; i >= 1; i--) {
        const dateObj = getPastDate(i);
        dateMap.push(dateObj);
        const url = `${KOBIS_BASE_URL}?key=${import.meta.env.VITE_KOBIS_API_KEY
          }&targetDt=${dateObj.apiFmt}`;
        requests.push(fetch(url));
      }

      const responses = await Promise.all(requests);
      const jsonResults = await Promise.all(responses.map((res) => res.json()));

      // 데이터 가공
      const chartData: ChartDataPoint[] = [];
      const movieSet = new Set<string>();

      jsonResults.forEach((json: DailyData, index) => {
        if (!json.boxOfficeResult) return;

        const dailyList = json.boxOfficeResult.dailyBoxOfficeList;
        const dataPoint: ChartDataPoint = {
          date: dateMap[index].displayFmt,
          fullDate: dateMap[index].apiFmt,
        };

        dailyList.forEach((movie) => {
          const rank = parseInt(movie.rank, 10);
          // 1위부터 10위까지만 추적
          if (rank <= 10) {
            dataPoint[movie.movieNm] = rank;
            movieSet.add(movie.movieNm);
          }
        });

        chartData.push(dataPoint);
      });

      setData(chartData);
      setAllMovies(Array.from(movieSet));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError(
        "데이터를 불러오는 중 오류가 발생했습니다. (API 키 확인 또는 CORS 문제일 수 있습니다)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOfficeData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => a.value - b.value);

      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl text-white">
          <p className="font-bold mb-2 text-slate-300 border-b border-slate-600 pb-1">
            {label} 순위
          </p>
          <ul className="text-sm space-y-1">
            {sortedPayload.map((entry: any, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="font-mono font-bold w-8 text-right">
                  {entry.value}위
                </span>
                <span className="text-slate-200">{entry.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-6 font-sans pt-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <header>
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200 flex items-center gap-3">
              <TrendingUp className="text-yellow-200" size={36} />
              Weekly Box Office Flow
            </h1>

            <p className="text-sm text-white/70 whitespace-nowrap text-right pl-4">
              지난 7일간의 박스오피스 순위 변동을 한눈에 확인해보세요.
            </p>
          </div>
        </header>

        <div className="w-full flex justify-end mt-2">
          <button
            onClick={fetchBoxOfficeData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-[#0b4747] hover:bg-yellow-400 cursor-pointer rounded-md transition-colors text-sm font-medium border border-slate-700"
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
        <div className="bg-black/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
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
                  reversed={true} // 순위 그래프이므로 1위가 위로 가도록 반전준거임
                  domain={[1, 10]} // 1위 ~ 10위
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

                {allMovies.map((movieName, index) => (
                  <Line
                    key={movieName}
                    type="monotone"
                    dataKey={movieName}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#181818" }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                    connectNulls={true} // 순위권 밖으로 나갔다 들어와도 선 연결
                    animationDuration={1500}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 하단에 요약카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-10">
          {/* 오늘 1등 */}
          <div className="bg-black/30 p-6 rounded-lg border border-slate-800">
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
          <div className="bg-black/30 p-6 rounded-lg border border-slate-800">
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
