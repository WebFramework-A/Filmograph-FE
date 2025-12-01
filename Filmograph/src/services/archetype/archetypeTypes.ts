// src/services/archetype/archetypeTypes.ts

export interface Character {
  id: string;
  name: string;
  movieCd: string;
  movieTitle: string;
  description: string;
  profileUrl: string;
  archetypeId: string;
  archetypeScore?: number;
}

// 나머지 타입들
export type ArchetypeId =
  | "hero"
  | "villain"
  | "revenge"
  | "outsider"
  | "brain"
  | "adventurer"
  | "candy"
  | "wizard"
  | "spy";
