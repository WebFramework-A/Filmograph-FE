import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/data/firebaseConfig";

import { toCharacters } from "./toCharacters";
import { classifyByArchetype } from "./classifyByArchetype";
import type { Character } from "./archetypeTypes";

export async function getCharacters(): Promise<Character[]> {
  const snap = await getDocs(collection(db, "characters"));
  const all: Character[] = [];

  snap.forEach((doc) => {
    const obj = doc.data();
    console.log("Raw doc:", obj); 
    all.push(...toCharacters(obj));
  });
  const classified = classifyByArchetype(all);
  return classified;
}
