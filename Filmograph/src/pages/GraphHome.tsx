import Button from "../components/common/Button";
import GuideCard from "../components/GraphPage/GuideCard";

const GraphHome = () => {
  return (
    <div className="min-h-screen pt-30 bg-[#0d5a5a]">
      {/* 헤더 */}
      <div className="pb-4 px-8">
        <h1 className="text-6xl font-normal text-center mb-4 text-yellow-300">
          영화 관계망
        </h1>

        <p className="text-center text-white/80 mb-8">
          배우, 감독, 영화를 연결하는 복잡한 관계를 네트워크로 시각화합니다
        </p>

        {/* 카테고리 버튼 */}
        <div className="flex justify-center gap-3 max-w-3xl mx-auto mb-6">
          <Button text="영화-영화인 그래프" />
          <Button text="에고 그래프" />
          <Button text="협업 네트워킹 그래프" />
        </div>
      </div>

      {/* 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-12 max-w-6xl mx-auto">
        <GuideCard
          title="드래그로 이동"
          description="캔버스를 클릭하여 드래그하여 여러 네트워크를 이동할 수 있습니다"
        />
        <GuideCard
          title="노드 클릭"
          description="배우, 감독, 영화 노드를 클릭하여 상세 정보를 확인하고 관계를 탐색할 수 있습니다"
        />
        <GuideCard
          title="줌 조절"
          description="줌 버튼을 사용하여 네트워크를 확대/축소할 수 있습니다"
        />
      </div>
    </div>
  );
};

export default GraphHome;
