export interface Person {
  id: string;              // KOBIS peopleCd
  name: string;            // 한글 이름
  nameEn?: string;         // 영문 이름
  repRoleNm?: string;      // 직군
  filmo?: string[];        // 대표 출연작 / 참여작 제목 배열
  profileImage?: string | null; // 나중에 TMDB에서 추가
  createdAt: string;       // 수집 시각
}

