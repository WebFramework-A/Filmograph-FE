import { useEffect, useMemo, useState } from "react";
import { getArchetypedCharacters } from "../services/archetype/archetypeData";
import { ARCHETYPE_RULES } from "../services/archetype/archetypeRules";
import type {
  ArchetypeId,
  Character,
} from "../services/archetype/archetypeTypes";

const ArchetypePage = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedArchetype, setSelectedArchetype] =
    useState<ArchetypeId | null>(null);

  // Firestore에서 캐릭터 불러오기
  useEffect(() => {
    async function load() {
      const data = await getArchetypedCharacters();
      setCharacters(data);
    }
    load();
  }, []);

  const filteredCharacters = useMemo(() => {
    if (!selectedArchetype) return [];
    return characters.filter((c) => c.archetypeId === selectedArchetype);
  }, [characters, selectedArchetype]);

  const selectedRule = selectedArchetype
    ? ARCHETYPE_RULES.find((r) => r.id === selectedArchetype)
    : null;

  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* 잡지 헤더 */}
        <header className="mb-2 md:mb-3">
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200">
              Character Archetype
            </h1>
            <p className="text-sm text-white/70">
              다양한 캐릭터 아키타입의 세계를 탐험해보세요.
            </p>
          </div>
        </header>

        {/* 아키타입 선택 화면 */}
        {!selectedArchetype && (
          <section className="mb-10">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-50/70">
                  archetype index
                </p>
                <h2 className="mt-1 text-xl font-semibold text-emerald-50">
                  보고 싶은 캐릭터 아키타입을 선택하세요.
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ARCHETYPE_RULES.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setSelectedArchetype(rule.id)}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-white/18 bg-emerald-950/35 px-4 py-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-white/45 hover:bg-emerald-950/60 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-100/80">
                    <span>type</span>
                  </div>

                  <div className="mt-4 flex-1">
                    <h3 className="text-lg font-semibold leading-snug text-emerald-50">
                      {rule.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-emerald-50/85">
                      {rule.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1 items-baseline">
                    {rule.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-emerald-900/70 px-2 py-0.5 text-[10px] text-emerald-50/95"
                      >
                        {kw}
                      </span>
                    ))}
                    {rule.keywords.length > 3 && (
                      <span className="inline-block transform -translate-y-px text-[11px] leading-none text-emerald-50/70">
                        + more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 아키타입 상세 화면 */}
        {selectedArchetype && selectedRule && (
          <section className="mt-4 mb-10">
            <div className="rounded-4xl bg-slate-50 text-slate-900 px-6 py-8 shadow-[0_26px_70px_rgba(0,0,0,0.6)] md:px-10 md:py-10">
              <div className="mb-10 flex flex-col gap-8 border-b border-slate-200 pb-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div
                    onClick={() => setSelectedArchetype(null)}
                    className="
                      mb-8 cursor-pointer select-none
                      border-b border-dashed border-slate-200
                      pb-2 text-[12px] font-semibold uppercase tracking-[0.25em]
                      text-slate-500
                      transition-colors
                      hover:text-yellow-400"
                  >
                    ← back to index
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                    character archetype
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold italic tracking-tight md:text-4xl">
                    {selectedRule.name}
                  </h2>
                  <p className="mt-4 text-base text-slate-700">
                    {selectedRule.description}
                  </p>
                </div>

                <div className="w-full max-w-xs border-l border-slate-200 pl-6 text-sm text-slate-700 md:pl-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    archetype
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedRule.name}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-600"></p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selectedRule.keywords.slice(0, 6).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-slate-900/5 px-3 py-0.5 text-xs text-slate-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <div className="h-6 w-1 bg-slate-900" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        iconic portrayals
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        이 아키타입을 대표하는 캐릭터들
                      </h3>
                    </div>
                  </div>
                </div>

                {filteredCharacters.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-sm text-slate-500">
                    아직 이 아키타입에 등록된 캐릭터가 없어요.
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-6">
                    {filteredCharacters.map((ch) => (
                      <article
                        key={ch.id}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-900/70 hover:shadow-[0_22px_55px_rgba(0,0,0,0.25)]"
                      >
                        <div className="relative aspect-4/5 overflow-hidden bg-slate-900">
                          {/* 캐릭터 이미지 */}
                          <img
                            src={ch.profileUrl}
                            alt={ch.name}
                            className="w-full h-full object-cover"
                          />

                          {/* 위에 덮는 그라데이션 */}
                          <div className="absolute inset-0 bg-liner-to-t from-black/25 to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col gap-1 px-2 py-1">
                          <p className="text-[13px] font-semibold text-slate-800">
                            {ch.name}
                          </p>
                          <p className="text-[12px] text-slate-500">
                            {ch.movieTitle}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArchetypePage;
