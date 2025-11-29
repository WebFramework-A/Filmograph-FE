import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { type MovieDetail } from "../../../types/movie";

export default function useAllMovies() {
    // [수정] state 타입을 MovieDetail[]로 변경
    const [movies, setMovies] = useState<MovieDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "movies"));

                // [수정] 데이터를 MovieDetail[]로 변환
                const movieList = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // [중요] avgRating이 없으면 rating을 사용하도록 처리
                        avgRating: data.avgRating || data.rating,
                    };
                }) as MovieDetail[];

                setMovies(movieList);
            } catch (error) {
                console.error("영화 전체 목록 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return { movies, loading };
}