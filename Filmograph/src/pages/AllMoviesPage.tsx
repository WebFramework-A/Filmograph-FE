import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAllMovies from "../features/movie/hooks/useAllMovies";
import Searcrbar from "../components/common/Searcrbar";
import { ImageWithFallback } from "../features/movie/components/ImageWithFallback";

const GENRES = ["전체", "액션", "가족", "멜로/로맨스", "코미디", "스릴러", "범죄", "미스터리", "SF", "판타지", "공포(호러)", "애니메이션", "뮤지컬", "공연", "다큐멘터리"];

export default function AllMoviesPage() {
    const navigate = useNavigate();
    const { movies, loading } = useAllMovies();

    // 필터 상태
    const [selectedGenre, setSelectedGenre] = useState("전체");
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        setSearchTerm(inputValue);
    };

    const filteredMovies = useMemo(() => {
        return movies.filter((movie) => {

            const rawGenre = movie.genre as any;
            let movieGenres: string[] = [];

            if (Array.isArray(rawGenre)) {
                movieGenres = rawGenre;
            }
            else if (typeof rawGenre === "string") {

                movieGenres = rawGenre.split(",").map((g: string) => g.trim());
            }

            const matchGenre =
                selectedGenre === "전체" || movieGenres.includes(selectedGenre);

            // 검색어 필터
            const matchSearch =
                searchTerm === "" ||
                movie.title.toLowerCase().includes(searchTerm.toLowerCase());

            return matchGenre && matchSearch;
        });
    }, [movies, selectedGenre, searchTerm]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d5a5a] flex items-center justify-center text-white">
                영화 목록을 불러오는 중...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d5a5a] text-white pt-24 pb-12 px-8">
            <div className="max-w-7xl mx-auto">

                {/* 1. 오늘의 추천 영화 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-yellow-200 mb-4">
                        🍿 오늘의 추천 영화 (Daily BoxOffice)
                    </h2>
                    <div className="bg-black/20 rounded-xl p-8 border border-white/10 flex items-center justify-center min-h-[200px]">
                        <p className="text-white/50 text-lg">
                            (여기에 일간 박스오피스 API를 연동한 추천 영화 컴포넌트가 들어갈 예정입니다)
                        </p>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">

                    {/* 2. 장르 카테고리 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-3">장르별 모아보기</h3>
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

                    {/* 3. 검색바 */}
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

                {/* 4. 영화 목록 */}
                <div className="mb-4 text-white/60 text-sm">
                    총 <span className="text-yellow-200 font-bold">{filteredMovies.length}</span>개의 영화가 있습니다.
                </div>

                {filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredMovies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => navigate(`/detail/${movie.id}`)}
                                className="group cursor-pointer relative bg-black/20 rounded-lg overflow-hidden border border-white/10 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="aspect-[2/3] w-full overflow-hidden bg-gray-800">
                                    <ImageWithFallback
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <h4 className="text-white font-bold text-lg leading-tight mb-1">
                                        {movie.title}
                                    </h4>
                                    <p className="text-yellow-400 text-sm font-medium">
                                        ★ {movie.avgRating ? movie.avgRating.toFixed(1) : "0.0"}
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