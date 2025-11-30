import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAllMovies from "../hooks/useAllMovies";
import Searcrbar from "../components/common/Searcrbar";
import { ImageWithFallback } from "../components/DetailPage/ImageWithFallback";
import DailyBoxOffice from "../components/DetailPage/DailyBoxOffice";

const GENRES = ["전체", "액션", "가족", "멜로/로맨스", "코미디", "스릴러", "범죄", "미스터리", "SF", "판타지", "공포(호러)", "애니메이션", "뮤지컬", "공연", "다큐멘터리"];

// 정렬 옵션 타입
type SortOption = "default" | "rating" | "title";
type SortOrder = "asc" | "desc";

export default function AllMoviesPage() {
    const navigate = useNavigate();
    const { movies, loading } = useAllMovies();

    // 필터 상태
    const [selectedGenre, setSelectedGenre] = useState("전체");
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // 정렬 상태 (기본값: 데이터베이스 내 id 순)
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const handleSearch = () => {
        setSearchTerm(inputValue);
    };

    const filteredAndSortedMovies = useMemo(() => {
        const result = movies.filter((movie) => {
            const rawGenre = movie.genre as any;
            let movieGenres: string[] = [];

            if (Array.isArray(rawGenre)) {
                movieGenres = rawGenre;
            } else if (typeof rawGenre === "string") {
                movieGenres = rawGenre.split(",").map((g: string) => g.trim());
            }

            const matchGenre =
                selectedGenre === "전체" || movieGenres.includes(selectedGenre);

            const matchSearch =
                searchTerm === "" ||
                movie.title.toLowerCase().includes(searchTerm.toLowerCase());

            return matchGenre && matchSearch;
        });

        // 정렬 로직
        result.sort((a, b) => {
            if (sortOption === "default") {
                // 기본순 (ID 기준 정렬)
                return sortOrder === "asc"
                    ? a.id.localeCompare(b.id)
                    : b.id.localeCompare(a.id);
            }
            else if (sortOption === "rating") {
                const ratingA = a.rating ?? 0;
                const ratingB = b.rating ?? 0;
                // 내림차순(desc): 높은 점수부터, 오름차순(asc): 낮은 점수부터
                return sortOrder === "desc" ? ratingB - ratingA : ratingA - ratingB;
            }
            else if (sortOption === "title") {
                // 한글/영어 문자열 비교 (localeCompare 사용)
                return sortOrder === "asc"
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            return 0;
        });

        return result;
    }, [movies, selectedGenre, searchTerm, sortOption, sortOrder]);

    if (loading) {
        return (
            <div className="text-white text-xl font-semibold animate-pulse">
                영화 목록 불러오는 중 · · ·
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto">

                {/* 헤더 */}
                <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
                    <h1 className="text-4xl font-bold text-yellow-200">Movies</h1>
                    <p className="text-sm text-white/70">Filmograph의 모든 영화를 탐색해보세요.</p>
                </div>

                {/* 오늘의 추천 영화 */}
                <section className="mb-16">
                    <h2 className="mt-1 text-xl font-semibold text-emerald-50">
                        오늘의 추천 영화
                    </h2>
                    <DailyBoxOffice />
                </section>

                {/* 장르 카테고리 */}
                <div className="mb-10 border-b border-white/10 pb-8">
                    <h2 className="mt-1 text-xl font-semibold text-emerald-50 mb-4">
                        장르별 모아보기
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {GENRES.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm transition-all border ${selectedGenre === genre
                                    ? "bg-yellow-400 text-black border-yellow-400 font-bold shadow-lg scale-105"
                                    : "bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:border-white/50"
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 검색바 & 정렬 옵션 */}
                <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
                    {/* 정렬 옵션 UI */}
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="bg-transparent text-white text-sm px-2 py-1 outline-none cursor-pointer [&>option]:text-black"
                        >
                            <option value="default">기본순</option>
                            <option value="rating">별점순</option>
                            <option value="title">제목순</option>
                        </select>
                        <div className="w-px h-4 bg-white/20"></div>
                        <button
                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            className="text-white/70 hover:text-white px-2 text-sm font-bold transition-colors"
                            title={sortOrder === "asc" ? "오름차순 (낮은 순/가나다)" : "내림차순 (높은 순/하파타)"}
                        >
                            {sortOrder === "asc" ? "▲ 오름차순" : "▼ 내림차순"}
                        </button>
                    </div>

                    {/* 검색바 */}
                    <div className="w-full md:w-96">
                        <Searcrbar
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSearch={handleSearch}
                            placeholder={
                                selectedGenre === "전체"
                                    ? "영화 제목을 검색해보세요."
                                    : `'${selectedGenre}' 장르 내에서 검색`
                            }
                        />
                    </div>
                </div>

                {/* 영화 목록 */}
                <div className="mb-4 text-white/60 text-sm flex justify-between items-center">
                    <div>
                        총 <span className="text-yellow-200 font-bold">{filteredAndSortedMovies.length}</span>개의 영화가 있습니다.
                    </div>
                </div>

                {filteredAndSortedMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                        {filteredAndSortedMovies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => navigate(`/detail/${movie.id}`)}
                                className="group cursor-pointer relative bg-black/20 rounded-lg overflow-hidden border border-white/10 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="aspect-2/3 w-full overflow-hidden bg-gray-800">
                                    <ImageWithFallback
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <h4 className="text-white font-bold text-lg leading-tight mb-1">
                                        {movie.title}
                                    </h4>
                                    <p className="text-yellow-400 text-sm font-medium">
                                        ★ {movie.rating?.toFixed(1)}
                                    </p>
                                    <p className="text-white/60 text-xs mt-2 line-clamp-2">
                                        {Array.isArray(movie.genre)
                                            ? movie.genre.join(", ")
                                            : movie.genre}
                                    </p>
                                </div>

                                <div className="p-3">
                                    <h4 className="text-white font-medium truncate text-sm group-hover:text-yellow-200 transition-colors">
                                        {movie.title}
                                    </h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-white/40 text-xs">
                                            {movie.releaseDate?.substring(0, 4)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-white/50 text-lg bg-black/20 rounded-xl border border-white/5">
                        조건에 맞는 영화가 없습니다. 😢
                    </div>
                )}

            </div>
        </div>
    );
}