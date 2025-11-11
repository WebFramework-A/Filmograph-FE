// src/services/people/peopleAPI.ts
import axios from "axios";
import type { Person } from "../../types/people";

const KOBIS_KEY = import.meta.env.VITE_KOBIS_API_KEY as string;
const BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";

const ALLOWED_ROLES = ["배우", "감독", "촬영", "음악", "각본", "시나리오"];

export interface KobisPersonListItem {
  peopleCd: string;
  peopleNm: string;
  peopleNmEn?: string;
  repRoleNm?: string;
  filmoNames?: string;
}

interface KobisFilmo {
  movieCd: string;
  movieNm: string;
  moviePartNm: string;
}
interface KobisPersonDetail {
  peopleCd: string;
  peopleNm: string;
  peopleNmEn?: string;
  repRoleNm?: string;
  filmos?: KobisFilmo[];
}

function isAllowedRole(repRoleNm?: string): boolean {
  if (!repRoleNm) return false;

  const tokens = repRoleNm
    .split(/[,·|\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return tokens.some((t) => ALLOWED_ROLES.includes(t));
}

//영화인 목록 조회 (필터 후 perPage 개수 맞춰 반환)
export async function fetchPeopleList(
  page = 1,
  perPage = 100
): Promise<KobisPersonListItem[]> {
  const result: KobisPersonListItem[] = [];
  let curPage = 1;
  const skipCount = (page - 1) * perPage;

  while (result.length < skipCount + perPage) {
    const res = await axios.get(`${BASE_URL}/people/searchPeopleList.json`, {
      params: {
        key: KOBIS_KEY,
        curPage: curPage,
        itemPerPage: 100,
      },
    });

    const list: KobisPersonListItem[] =
      res.data?.peopleListResult?.peopleList || [];
    if (!list.length) break;

    const filtered = list.filter((p) => isAllowedRole(p.repRoleNm));
    result.push(...filtered);

    curPage++;
  }

  return result.slice(skipCount, skipCount + perPage);
}

//영화인 상세 조회 → Person 형태로 변환 (허용 직군만)
export async function fetchPeopleDetail(
  peopleCd: string
): Promise<Person | null> {
  const res = await axios.get(`${BASE_URL}/people/searchPeopleInfo.json`, {
    params: { key: KOBIS_KEY, peopleCd },
  });

  const info: KobisPersonDetail | undefined =
    res.data?.peopleInfoResult?.peopleInfo;

  if (!info) return null;
  if (!isAllowedRole(info.repRoleNm)) return null;

  const filmoTitles = Array.from(
    new Set(
      (info.filmos || [])
        .map((f) => f.movieNm)
        .filter(Boolean)
    )
  );


  const person: Person = {
    id: info.peopleCd,
    name: info.peopleNm,
    nameEn: info.peopleNmEn,
    repRoleNm: info.repRoleNm,
    filmo: filmoTitles,
    profileImage: null,
    createdAt: new Date().toISOString(),
  };

  return person;
}
