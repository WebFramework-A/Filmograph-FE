// src/services/archetype/archetypeData.ts
import rawCharacters from "../../mock/characters.json";
import type { Character } from "./archetypeTypes";
import { classifyCharacters } from "./archetypeRules";

export function getArchetypedCharacters(): Character[] {
  const characters = rawCharacters as Character[];
  return classifyCharacters(characters);
}
