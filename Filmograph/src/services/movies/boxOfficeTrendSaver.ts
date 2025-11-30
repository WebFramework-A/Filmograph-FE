// src/services/boxOfficeTrendSaver.ts
import { db } from "../data/firebaseConfig";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

const KOBIS_BASE_URL =
  "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";

const getPastYmd = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

export async function save7DaysTrend() {
  const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY;

  console.log("기존 boxOfficeTrend 데이터 삭제 시작");
  const oldSnap = await getDocs(collection(db, "boxOfficeTrend"));

  for (const d of oldSnap.docs) {
    await deleteDoc(doc(db, "boxOfficeTrend", d.id));
  }
  console.log("기존 데이터 삭제 완료");

  console.log("주간 데이터 저장 시작…");

  for (let i = 7; i >= 1; i--) {
    const ymd = getPastYmd(i);
    const url = `${KOBIS_BASE_URL}?key=${KOBIS_KEY}&targetDt=${ymd}`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (!json.boxOfficeResult) {
        console.warn("boxOfficeResult 없음:", ymd);
        continue;
      }

      const dailyTop10 = json.boxOfficeResult.dailyBoxOfficeList
        .slice(0, 10)
        .map((m: any) => ({
          rank: Number(m.rank),
          movieNm: m.movieNm,
          movieCd: m.movieCd,
        }));

      await setDoc(doc(db, "boxOfficeTrend", ymd), {
        date: ymd,
        top10: dailyTop10,
        updatedAt: new Date().toISOString(),
      });

      console.log("저장 완료:", ymd);

      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error("저장 실패:", ymd, err);
    }
  }
  
  await setDoc(doc(db, "system", "boxOfficeTrendMeta"), {
    lastSavedAt: new Date().toISOString(),
  });
  
  console.log("주간 데이터 저장 완료!");
}