// src/pages/ArchetypePage.tsx
import { useMemo, useState } from "react";
import { getArchetypedCharacters } from "../services/archetype/archetypeData";
import { ARCHETYPE_RULES } from "../services/archetype/archetypeRules";
import type { ArchetypeId } from "../services/archetype/archetypeTypes";

const ArchetypePage = () => {
  const characters = useMemo(() => getArchetypedCharacters(), []);
  const [selectedArchetype, setSelectedArchetype] =
    useState<ArchetypeId | null>(null);

  const filteredCharacters = useMemo(() => {
    if (!selectedArchetype) return [];
    return characters.filter((c) => c.archetypeId === selectedArchetype);
  }, [characters, selectedArchetype]);

  const selectedRule = selectedArchetype
    ? ARCHETYPE_RULES.find((r) => r.id === selectedArchetype)
    : null;

  return (
    <div className="min-h-screen bg-[#0d5a5a] text-slate-50">
      {/* 가운데 정렬 컨테이너 */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        {/* 잡지 헤더 */}
        <header className="mb-10 md:mb-14">
          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                캐릭터 아키타입
              </h1>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-linear-to-r from-emerald-200/40 via-emerald-100/60 to-transparent" />
        </header>

        {/* 아키타입 선택 화면 - 잡지 인덱스 스타일 */}
        {!selectedArchetype && (
          <section>
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
                  className="group flex h-full flex-col justify-between rounded-3xl border border-white/18 bg-emerald-950/35 px-4 py-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-white/45 hover:bg-emerald-950/60"
                >
                  {/* 상단: 타입 넘버 & 태그 */}
                  <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-100/80">
                    <span>type</span>
                  </div>

                  {/* 가운데: 이름 + 설명 */}
                  <div className="mt-4 flex-1">
                    <h3 className="text-lg font-semibold leading-snug text-emerald-50">
                      {rule.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-emerald-50/85">
                      {rule.description}
                    </p>
                  </div>

                  {/* 하단: 키워드만 표시 (캐릭터 수 제거) */}
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
                      <span
                        className="inline-block transform -translate-y-[1px] text-[11px] leading-none text-emerald-50/70"
                      >
                        + more
                      </span>
                    )}
                  </div>


                          </button>
                        ))}
                      </div>
                    </section>
                  )}

        {/* 아키타입 선택 후: 잡지식 레이아웃으로 캐릭터 보여주기 */}
        {selectedArchetype && selectedRule && (
          <section className="mt-4">
            {/* 잡지 1페이지처럼 보이는 큰 카드 */}
            <div className="rounded-4xl bg-slate-50 text-slate-900 px-6 py-8 shadow-[0_26px_70px_rgba(0,0,0,0.6)] md:px-10 md:py-10">
              {/* 상단 헤더 영역 */}
              <div className="mb-10 flex flex-col gap-8 border-b border-slate-200 pb-8 md:flex-row md:items-start md:justify-between">
                {/* 왼쪽: 메인 타이포 */}
                <div className="max-w-2xl">
                  <div onClick={() => setSelectedArchetype(null)}
                  className="
                    mb-8 cursor-pointer select-none
                    border-b border-dashed border-slate-200
                    pb-2 text-[12px] font-semibold uppercase tracking-[0.25em]
                    text-slate-500
                    transition-colors
                    hover:text-yellow-400" >
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

                {/* 오른쪽: Archetype 정보 박스 */}
                <div className="w-full max-w-xs border-l border-slate-200 pl-6 text-sm text-slate-700 md:pl-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    archetype
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedRule.name}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                    영화 속 다양한 작품에서 반복해서 등장하는 캐릭터 유형입니다.
                    작품과 장르에 따라 결이 달라지지만, 공통된 성격과 역할
                    패턴이 관객에게 강한 인상을 남깁니다.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selectedRule.keywords.slice(0, 6).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-slate-900/5 px-3 py-0.5 text-[11px] text-slate-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 하단: Iconic Portrayals 섹션 */}
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
                  <div className="grid gap-6 md:grid-cols-3">
                    {filteredCharacters.map((ch, idx) => (
                      <article
                        key={ch.id}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-900/70 hover:shadow-[0_22px_55px_rgba(0,0,0,0.25)]"
                      >
                        {/* 이미지 자리 (지금은 플레이스홀더, 나중에 포스터/스틸컷 넣기) */}
                        <div className="relative aspect-4/5 overflow-hidden bg-slate-900">
                          {/* <img src={ch.profileUrl} alt={ch.name} className="h-full w-full object-cover" /> */}

                          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-90" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
                              {String(idx + 1).padStart(2, "0")}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-50">
                              {ch.name}
                            </p>
                            <p className="text-[11px] text-slate-200/90">
                              {ch.movieTitle}
                            </p>
                          </div>
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                          <p className="line-clamp-3 text-[13px] leading-relaxed text-slate-700">
                            {ch.description}
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
