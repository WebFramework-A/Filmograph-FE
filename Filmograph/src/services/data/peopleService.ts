import { db } from "./firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { fetchPeopleList, fetchPeopleDetail } from "../people/peopleAPI";
import { searchPersonSimple, fetchCharacterRoles } from "../people/characterAPI";

/*
  Firestore에 영화인(배우/감독 등) 데이터를 저장
*/

const TARGET_COUNT = 500;   // 추가로 저장하고 싶은 인원 수로 바꿔서 사용
const PER_PAGE = 100;       // KOBIS 한 페이지 최대 100명

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function collectPeopleData() {
  console.log("영화인 데이터 수집 (신규 추가 전용 시작)");

  const personsCollection = collection(db, "persons");

  let added = 0;      // 이번 실행에서 새로 추가된 사람 수
  let curPage = 1;    // KOBIS 페이지 번호

  while (added < TARGET_COUNT) {
    console.log(`KOBIS page ${curPage} 불러오는 중...`);
    const peopleList = await fetchPeopleList(curPage, PER_PAGE);

    if (!peopleList.length) {
      console.log("더 이상 가져올 영화인 없음. 중단합니다.");
      break;
    }

    for (const item of peopleList) {
      if (added >= TARGET_COUNT) break;

      try {
        // KOBIS 상세 정보
        const detail = await fetchPeopleDetail(item.peopleCd);
        if (!detail) continue;

        const personRef = doc(personsCollection, detail.id);
        const existingSnap = await getDoc(personRef);

        // 이미 persons 컬렉션에 있는 사람이라면 → 스킵
        if (existingSnap.exists()) {
          console.log(`이미 존재 → 스킵: ${detail.name} (${detail.repRoleNm})`);
          continue;
        }

        // TMDB 검색 (영문 이름 우선, 없으면 한글 이름으로 검색)
        const tmdbPerson =
          (detail.nameEn && (await searchPersonSimple(detail.nameEn))) ||
          (await searchPersonSimple(detail.name));

        if (!tmdbPerson) {
          console.log(`⏭ TMDB 매칭 실패 → 스킵: ${detail.name}`);
          continue;
        }

        // TMDB에서 캐릭터(배역) 목록 가져오기
        const characters = await fetchCharacterRoles(tmdbPerson.id);

        // Firestore "persons" 컬렉션에 신규 저장
        await setDoc(
          personRef,
          {
            ...detail,                      // KOBIS에서 가져온 기본 정보
            tmdbId: tmdbPerson.id,          // TMDB person id
            profileImage: tmdbPerson.profileImage, // TMDB 프로필 이미지 URL
            characters,                     // TMDB 캐릭터/배역 목록
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        added++;
        console.log(`신규 ${added}명 저장 완료: ${detail.name}`);
        await delay(300); // API 남용 방지를 위한 딜레이
      } catch (err) {
        console.error("오류:", err);
      }
    }

    curPage++;
  }

  console.log(`이번 실행에서 새로 추가된 인원: ${added}명`);
}

collectPeopleData();
