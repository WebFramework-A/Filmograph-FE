// src/services/archetype/archetypeData.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Character } from "./archetypeTypes";

export async function getArchetypedCharacters(): Promise<Character[]> {
  const snap = await getDocs(collection(db, "characters"));
  return snap.docs.map((doc) => doc.data() as Character);
}
