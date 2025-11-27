import { useState } from "react";
import Button from "../components/common/Button";
import GuideCard from "../components/GraphPage/GuideCard";
import ScrollReveal from "../components/common/ScrollReveal";
import { Check } from "lucide-react";
import Arrow from "../components/common/Arrow";
import { useNavigate } from "react-router-dom";

const GraphHome = () => {
  const [graphType, setGraphType] = useState(0); // 그래프 설명을 위한 상태
  const navigate = useNavigate();

  const description = [
    {
      type: "movie",
      description: (
        <div className="flex flex-col ">
          <div className="mb-6">
            <b>'영화'</b> 와 <b>'영화인'</b>을 두 개의 그룹으로 명확히 나누고,
            오직 <b>참여 관계</b>만을 선으로 연결하여 데이터를 직관적으로
            보여줍니다.
          </div>
          <div className="flex flex-col items-start mb-4">
            <div className="flex justify-center items-center gap-1 font-semibold">
              <Check size={15} /> 이럴때 보면 좋아요
            </div>
            영화의 전체 출연진, 특정 인물의 필모그래피를 한 눈에 파악하고 싶을때
          </div>
          <Arrow
            title="보러가기"
            color="green"
            size="sm"
            onClick={() => navigate("/graph/movie")}
          />
        </div>
      ),
    },
    {
      type: "ego",
      description: (
        <div className="flex flex-col ">
          <div className="mb-6">
            선택한 <b>특정 인물</b>을 중심에 두고, 그와 직접{" "}
            <b>협업한 동료들</b>을 주변에 배치하여 개인의 <b>인맥 지도</b>를
            집중적으로 분석합니다. 함께 작업한 횟수가 많을수록 연결선을 두껍게
            표현하였습니다.
          </div>
          <div className="flex flex-col items-start mb-4">
            <div className="flex justify-center items-center gap-1 font-semibold">
              <Check size={15} /> 이럴때 보면 좋아요
            </div>
            특정 인물의 협업 친밀도나 작업 스타일을 파악하고 싶을 때
          </div>
          <Arrow
            title="보러가기"
            color="green"
            size="sm"
            onClick={() => navigate("/graph/ego")}
          />
        </div>
      ),
    },
    {
      type: "collaboration",
      description: (
        <div className="flex flex-col ">
          <div className="mb-6">
            전체 영화인 데이터를 분석하여 <b>자주 협업하는 그룹</b>을 Louvain
            알고리즘이 자동으로 찾아내어 시각화해 줍니다. 같은 집단을 동일한
            색상으로 묶어 표현하였습니다.
          </div>
          <div className="flex flex-col items-start mb-4">
            <div className="flex justify-center items-center gap-1 font-semibold">
              <Check size={15} /> 이럴때 보면 좋아요
            </div>
            '특정 감독 사단'이나 '마블 유니버스'처럼 영화계의 거시적인 형태와
            생태계 구조를 발견하고 싶을 때
          </div>
          <Arrow
            title="보러가기"
            color="green"
            size="sm"
            onClick={() => navigate("/graph/collaboration")}
          />
        </div>
      ),
    },
  ];

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
          <Button
            text="영화-영화인 그래프"
            onClick={() => setGraphType(0)}
            isOpen={graphType === 0}
          />
          <Button
            text="에고 그래프"
            onClick={() => setGraphType(1)}
            isOpen={graphType === 1}
          />
          <Button
            text="협업 네트워킹 그래프"
            onClick={() => setGraphType(2)}
            isOpen={graphType === 2}
          />
        </div>
      </div>

      {/* 그래프별 설명 */}
      <ScrollReveal>
        <div className="max-w-6xl w-xl md:w-2xl lg:w-3xl xl:w-4xl mx-auto border border-yellow-100/50 shadow-xl rounded-md py-6 px-10 bg-yellow-100/70  text-[#0d5a5a]">
          {description[graphType].description}
        </div>
      </ScrollReveal>

      {/* 가이드 */}
      <div className=" px-8 py-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-xl text-yellow-300 mb-3">그래프 사용방법</div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal>
            <GuideCard
              title="드래그로 이동"
              description="캔버스를 클릭하여 드래그하여 여러 네트워크를 이동할 수 있습니다"
            />
          </ScrollReveal>
          <ScrollReveal>
            <GuideCard
              title="노드 클릭"
              description="배우, 감독, 영화 노드를 클릭하여 상세 정보를 확인하고 관계를 탐색할 수 있습니다"
            />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default GraphHome;
