import { collection, getDocs } from "firebase/firestore";
import { db } from "../data/firebaseConfig";

export type Character = {
  id: string;
  name: string;
  movieTitle: string;
  profileUrl: string;
  description: string;
  archetype: string; // hero, villain 등
};

export async function getCharacters(): Promise<Character[]> {
  const snap = await getDocs(collection(db, "characters"));
  return snap.docs.map((d) => d.data() as Character);
}
