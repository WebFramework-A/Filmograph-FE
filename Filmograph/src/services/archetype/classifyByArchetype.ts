import type { Character } from "./archetypeTypes";
import { ARCHETYPE_RULES } from "./archetypeRules";

export function classifyByArchetype(characters: Character[]): Character[] {
  return characters.map((c): Character => {
    let best = null;
    let bestScore = 0;

    // name, description, movieTitle을 합쳐서 검색
    const text = `${c.name} ${c.description} ${c.movieTitle}`.toLowerCase();

    for (const rule of ARCHETYPE_RULES) {
      let score = 0;

      for (const kw of rule.keywords) {
        if (text.includes(kw.toLowerCase())) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = rule.id;
      }
    }
    console.log("[분류 중]", c.name, "->", best, "점수:", bestScore);
    return {
      ...c,
      archetypeId: best,
      archetypeScore: bestScore,
    };
  });
}
