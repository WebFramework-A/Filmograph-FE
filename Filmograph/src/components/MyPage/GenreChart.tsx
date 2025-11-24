import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { GenreData } from "../../pages/MyPage";

interface Props {
    genreData: GenreData[];
}

export default function GenreChart({ genreData }: Props) {
    return (
        <div className="bg-black/20 p-8 rounded-lg border border-white/5 shadow-md">
            <h3 className="text-2xl font-bold text-[#FFD700] mb-6">취향 분석</h3>
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
                        {genreData.map((genre) => (
                            <div key={genre.name} className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: genre.color }}
                                ></span>
                                <span className="text-white/80">{genre.name}</span>
                                <span className="ml-auto font-bold">{genre.value}%</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/10 p-4 rounded-lg text-sm mt-6">
                        <p className="mb-2">
                            💡 <strong>분석 결과</strong>
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-white/80">
                            <li>
                                가장 선호하는 장르는{" "}
                                <span className="text-[#4FC3F7] font-bold">스릴러</span>입니다.
                            </li>
                            <li>다양한 장르를 골고루 즐기시는 편이네요!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}