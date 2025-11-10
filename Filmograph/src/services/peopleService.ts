// src/services/peopleService.ts

import { db } from "./firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { fetchPeopleList, fetchPeopleDetail } from "./people/peopleAPI";
import { searchPersonSimple, fetchCharacterRoles } from "./people/characterAPI";

// Firestore에 영화인(배우) 데이터를 저장하는 서비스
//  - 1) KOBIS 인물 다건 수집
//  - 2) TMDB 인물/배역 정보 병합
//  - 3) Firestore "persons" 컬렉션에 저장

const TARGET_COUNT = 500;
const PER_PAGE = 100;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function collectPeopleData() {
  console.log("영화인 데이터 수집");
  const personsCollection = collection(db, "persons");

  let total = 0;
  let curPage = 1;

  while (total < TARGET_COUNT) {
    console.log(`KOBIS page ${curPage} 불러오는 중...`);
    const peopleList = await fetchPeopleList(curPage, PER_PAGE);
    if (!peopleList.length) break;

    for (const item of peopleList) {
      if (total >= TARGET_COUNT) break;

      try {
        const detail = await fetchPeopleDetail(item.peopleCd);
        if (!detail) continue;

        const tmdbPerson =
          (detail.nameEn && (await searchPersonSimple(detail.nameEn))) ||
          (await searchPersonSimple(detail.name));
        if (!tmdbPerson) {
          console.log(`⏭ TMDB 매칭 실패: ${detail.name}`);
          continue;
        }

        const characters = await fetchCharacterRoles(tmdbPerson.id);

        await setDoc(
          doc(personsCollection, detail.id),
          {
            ...detail,
            tmdbId: tmdbPerson.id,
            profileImage: tmdbPerson.profileImage,
            characters,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        total++;
        console.log(`${total}명 저장 완료: ${detail.name}`);
        await delay(300);
      } catch (err) {
        console.error("오류:", err);
      }
    }

    curPage++;
  }

  console.log(`총 ${total}명 수집`);
}
collectPeopleData();