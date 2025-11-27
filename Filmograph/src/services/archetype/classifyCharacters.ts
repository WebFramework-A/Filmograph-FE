import type { Character } from "./getCharacters";

export function groupByArchetype(characters: Character[]) {
  const groups: Record<string, Character[]> = {};

  characters.forEach((c) => {
    if (!groups[c.archetype]) groups[c.archetype] = [];
    groups[c.archetype].push(c);
  });

  return groups;
}
