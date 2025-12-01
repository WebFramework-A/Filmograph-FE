import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { GenreData } from "../../pages/MyPage";
import { useMemo } from "react";

interface Props {
    genreData: GenreData[];
}

export default function GenreChart({ genreData }: Props) {

    // 전체 개수 계산 (퍼센트 계산을 위해 필요)
    const totalValue = useMemo(() => {
        return genreData.reduce((acc, cur) => acc + cur.value, 0);
    }, [genreData]);

    // 데이터 분석 - 찜 이용하여 가장 선호하는 장르
    const topGenres = useMemo(() => {
        if (genreData.length === 0) return [];

        // 동률 처리하기
        // 장르 중 가장 높은 비중(숫자) 찾기
        const maxVal = Math.max(...genreData.map((d) => d.value));

        // 비중이 같은 장르들을 모두 필터링해서 배열로 만듦
        return genreData.filter((d) => d.value === maxVal);
    }, [genreData]);

    // 멘트 로직
    const diversityComment = useMemo(() => {
        if (topGenres.length === 0) return "데이터가 충분하지 않습니다.";

        const topPercentage = (topGenres[0].value / totalValue) * 100;

        return topPercentage >= 50
            ? "한 우물만 파는 뚝심있는 취향이시군요!"
            : "다양한 장르를 골고루 즐기시는 편이네요!";
    }, [topGenres, totalValue]);

    if (genreData.length === 0) {
        return (
            <div className="bg-black/20 p-8 rounded-lg border border-white/5 shadow-md flex items-center justify-center h-64 text-white/50">
                분석할 영화 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-black/20 p-8 rounded-lg border border-white/5 shadow-md">
            <h3 className="text-2xl font-bold text-yellow-200 mb-6">취향 분석</h3>
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
                                formatter={(value: number) => {
                                    const percent = ((value / totalValue) * 100).toFixed(1);
                                    return `${percent}%`;
                                }}
                                contentStyle={{
                                    backgroundColor: "#1a1a1a",
                                    border: "none",
                                    borderRadius: "8px",
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 범례 */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        {genreData.map((genre) => {
                            // 범례
                            const percent = ((genre.value / totalValue) * 100).toFixed(1);

                            return (
                                <div key={genre.name} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: genre.color }}
                                    ></span>
                                    <span className="text-white/80">{genre.name}</span>
                                    <span className="ml-auto font-bold">{percent}%</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 분석 결과 출력하기 */}
                    <div className="bg-white/10 p-4 rounded-lg text-sm mt-6">
                        <p className="mb-2">
                            <strong>분석 결과</strong>
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-white/80">
                            <li>
                                가장 선호하는 장르는{" "}
                                {/* 동률인 장르 쉼표로 연결 모두 표시 */}
                                {topGenres.map((genre, index) => (
                                    <span key={genre.name}>
                                        <span
                                            className="font-bold"
                                            style={{ color: genre.color }}
                                        >
                                            {genre.name}
                                        </span>
                                        {/* 마지막 요소가 아니면 뒤에 쉼표 추가 */}
                                        {index < topGenres.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                                입니다.
                            </li>
                            {/* 멘트 출력 */}
                            <li>{diversityComment}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}