import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";

// 데이터 타입 정의
export interface BoxOfficeMovie {
    rank: string;
    movieNm: string;
    openDt: string;
    audiAcc: string;
    posterUrl?: string;
    tmdbId?: number;
}

const KOBIS_API_KEY = import.meta.env.VITE_KOBIS_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// 어제 날짜 구하기
const getYesterdayString = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10).replace(/-/g, "");
};

// TMDB 포스터 가져오기
const fetchPoster = async (movieName: string) => {
    try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=ko-KR`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return {
                posterUrl: data.results[0].poster_path
                    ? `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`
                    : null,
                tmdbId: data.results[0].id
            };
        }
        return { posterUrl: null, tmdbId: null };
    } catch (error) {
        console.error("박스오피스 포스터 호출 오류", error);
        return { posterUrl: null, tmdbId: null };
    }
};

// 메인 함수
export const getDailyBoxOffice = async (): Promise<BoxOfficeMovie[]> => {
    const targetDate = getYesterdayString();
    const docRef = doc(db, "dailyBoxOffice", targetDate);

    try {
        // 파이어베이스 확인
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("[캐싱됨] Firestore에서 데이터 로드");
            return docSnap.data().movies as BoxOfficeMovie[];
        }

        // API 호출 (프록시 사용)
        console.log("[API 호출] KOBIS에서 새로 가져옵니다...");

        const kobisUrl = `/kobis/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${targetDate}`;

        const res = await fetch(kobisUrl);
        if (!res.ok) throw new Error(`KOBIS API Error: ${res.status}`);

        const data = await res.json();
        const list = data.boxOfficeResult?.dailyBoxOfficeList || [];

        // 포스터 추가
        const moviesWithPosters = await Promise.all(
            list.map(async (item: any) => {
                const { posterUrl, tmdbId } = await fetchPoster(item.movieNm);
                return {
                    rank: item.rank,
                    movieNm: item.movieNm,
                    openDt: item.openDt,
                    audiAcc: item.audiAcc,
                    posterUrl,
                    tmdbId
                };
            })
        );

        // 파이어베이스 저장
        if (moviesWithPosters.length > 0) {
            await setDoc(docRef, {
                date: targetDate,
                movies: moviesWithPosters,
                createdAt: serverTimestamp()
            });
            console.log("[저장 완료] Firestore에 저장됨");
        }

        return moviesWithPosters;

    } catch (error) {
        console.error("박스오피스 에러:", error);
        return [];
    }
};