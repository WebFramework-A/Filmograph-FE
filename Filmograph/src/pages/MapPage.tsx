import WorldMap from "../components/WorldMap/WorldMap";

export default function MapTestPage() {
  return (
    <div className="min-h-screen bg-[#0b4747] text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto">

        {/* 헤더 */}
        <header className="mb-2 md:mb-3">
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <h1 className="text-4xl font-bold text-yellow-200">
              World Cinema Map
            </h1>
            <p className="text-sm text-white/70 text-right leading-relaxed">
              각 나라의 현재 가장 인기 있는 영화를 확인해보세요. <br />   영화 포스터를 클릭 시 상세페이지로 이동합니다.
            </p>
          </div>
        </header>

        {/* 지도 박스 */}
        <div className="mb-15 rounded-2xl border border-white/10 bg-black/10 p-4 shadow-xl">
          <WorldMap />
        </div>
      </div>
    </div>
  );
}
