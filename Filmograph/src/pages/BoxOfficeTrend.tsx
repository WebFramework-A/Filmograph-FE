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
import { useFetchBoxOfficeDate } from "../services/queries/useFetchBoxOfficeDate";

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
  // useQuery로 만들어둔 훅으로 데이터+서버상태 가져오기
  const { data, isLoading, isError, refetch } = useFetchBoxOfficeDate();

  // 훅에서 받은 데이터 구조분해
  const chartData = data?.chartData || [];
  const allMovies = data?.allMovies || [];
  const lastUpdated = data?.lastUpdated || "-";

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
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-[#0b4747] hover:bg-yellow-400 cursor-pointer rounded-md transition-colors text-sm font-medium border border-slate-700"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "로딩 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {/* 그래프 메인영역 */}
      <div className="max-w-6xl mx-auto px-2">
        {/* 현황 */}
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={12} /> {chartData[0]?.date} ~
            {chartData[chartData.length - 1]?.date} 까지의 일별 랭킹
          </span>
          <span className="text-sm text-slate-500">
            마지막 업데이트: {lastUpdated}
          </span>
        </div>

        {/* 에러처리 */}
        {isError && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle />
            {isError}
          </div>
        )}

        {/* 그래프 */}
        <div className="bg-black/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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

                {allMovies.map((movieName: string, index: number) => (
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
          <div className="bg-black/20 p-6 rounded-lg border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium mb-2">
              최신 1위 영화
            </h3>
            <p className="text-2xl font-bold text-yellow-300 truncate">
              {chartData.length > 0
                ? Object.keys(chartData[chartData.length - 1]).find(
                    (key) => chartData[chartData.length - 1][key] === 1
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
