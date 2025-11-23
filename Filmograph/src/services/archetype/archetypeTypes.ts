// src/services/archetype/archetypeTypes.ts

// 아키타입 ID 타입
export type ArchetypeId =
  | "HERO"      // 히어로
  | "VILLAIN"   // 악당
  | "AVENGER"   // 복수귀
  | "OUTSIDER"  // 아웃사이더
  | "BRAIN"     // 브레인(전략가)
  | "EXPLORER"  // 탐험가
  | "CANDY"     // 캔디
  | "MAGE"      // 마법사/멘토
  | "SPY";      // 스파이

// 캐릭터 타입
export type Character = {
  id: string;
  name: string;
  movieTitle: string;
  description: string;
  profileUrl?: string;

  // 아키타입 분류 결과
  archetypeId?: ArchetypeId;
  archetypeScore?: number;
};
