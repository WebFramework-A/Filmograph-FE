import type { DocumentData } from "firebase/firestore";
import type { Character } from "./archetypeTypes";

export function toCharacters(doc: DocumentData): Character[] {
  // Firestore 캐릭터
  return [
    {
      id: doc.id ?? "unknown",
      name: doc.name ?? "",
      movieTitle: doc.movieTitle ?? "",
      profileUrl: doc.profileUrl ?? "",
      description: doc.description ?? "",
      movieCd: doc.movieCd ?? "",
      archetypeId: doc.archetypeId ?? null,
      archetypeScore: 0,
    },
  ];
}
