// 영화 상세정보 fetch 로직
import { doc, getDoc } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { type MovieDetail } from "../../types/movie";

export async function getMovie(movieId: string): Promise<MovieDetail | null> {
  const ref = doc(db, "movies", movieId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as MovieDetail;
}
