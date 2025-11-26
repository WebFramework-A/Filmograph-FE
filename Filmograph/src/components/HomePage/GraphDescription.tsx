import { useState, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

const GraphDescription = () => {
  const navigate = useNavigate();

  const items = [
    {
      id: "001",
      text: "영화-영화인 그래프",
      description:
        "이 그래프는 '영화'와 '영화인'을 두 개의 그룹으로 명확히 나누고, 오직 참여 관계만을 선으로 연결하여 데이터를 직관적으로 보여줍니다. 노드의 모양과 색상을 달리하여 시각적 구분이 뚜렷하며, 특정 영화의 전체 출연진이나 특정 인물의 필모그래피를 한눈에 파악하기에 가장 적합한 기본 형태입니다.",
      url: "/graph/movie",
    },
    {
      id: "002",
      text: "에고 네트워크",
      description:
        "선택한 특정 인물을 중심에 두고, 그와 직접 협업한 동료들을 주변에 배치하여 개인의 인맥 지도를 집중적으로 분석합니다. 함께 작업한 횟수가 많을수록 연결선을 두껍게 표현함으로써, 해당 인물의 '핵심 파트너'가 누구인지와 작업 스타일을 직관적으로 확인할 수 있습니다.",
      url: "/graph/ego",
    },
    {
      id: "003",
      text: "협업 네트워크 & 커뮤니티",
      description:
        "전체 영화인 데이터를 분석하여 자주 협업하는 그룹을 알고리즘이 자동으로 찾아내어 시각화해 줍니다. '특정 감독 사단'이나 '마블 유니버스'처럼 끈끈하게 뭉친 집단을 같은 색상으로 묶어 보여주므로, 영화계의 거시적인 파벌과 생태계 구조를 발견하는 데 유용합니다.",
      url: "/graph/collaboration",
    },
  ];

  // 현재 보여줄 설명글 상태
  const [currentDesc, setCurrentDesc] = useState(items[0].description);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseEnter = (newDesc: SetStateAction<string>) => {
    if (currentDesc === newDesc) return;

    setIsAnimating(true);

    setTimeout(() => {
      setCurrentDesc(newDesc);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen snap-start flex flex-col items-center pt-50 bg-yellow-200">
      <div className="text-5xl mb-5 text-[#0b4747]">그래프 종류</div>

      <button
        className="border border-[#0b4747]/50 rounded-4xl hover:bg-[#0b4747] hover:text-white duration-400 px-4 py-2 mb-10 cursor-pointer transition-colors"
        onClick={() => navigate("/graph")}
      >
        전체 그래프 보러가기
      </button>

      <div className="grid grid-cols-3 w-full max-w-7xl px-10 py-5 gap-10 items-start">
        {/* 좌측 (리스트 부분) */}
        <div className="col-span-2 flex flex-col text-[#0b4747]">
          {/* 위에 테두리선 */}
          <div className="w-full border-t border-[#0b4747]/50"></div>

          {items.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer overflow-hidden"
              onMouseEnter={() => handleMouseEnter(item.description)}
              onClick={() => navigate(item.url)}
            >
              {/* 호버 시 배경색이 변하는 컨테이너 */}
              <div className="flex items-center py-4 px-2 transition-colors duration-300 relative z-10">
                {/* 화살표 애니메이션 배경 */}
                <div className="absolute left-35 right-0 h-px bg-[#0b4747] opacity-0 -translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out flex items-center">
                  <span className="absolute right-0 text-2xl text-[#0b4747] -mt-1">
                    &gt;
                  </span>
                </div>

                {/* 숫자 */}
                <span className="text-5xl font-serif italic tracking-tighter mr-16 text-[#0b4747]/50 group-hover:text-[#0b4747] transition-colors duration-300">
                  {item.id}
                </span>

                {/* 텍스트 */}
                <span className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl text-[#0b4747]/50 group-hover:text-[#0b4747] transition-colors duration-300 bg-yellow-200 pr-4 z-20 ">
                  {item.text}
                </span>
              </div>

              {/* 하단 테두리 */}
              <div className="w-full border-b border-[#0b4747]/50"></div>
            </div>
          ))}
        </div>

        {/* 우측 (그래프 설명 영역) */}
        <div className="col-span-1 flex items-center relative">
          <p
            className={`
              text-xl leading-relaxed text-[#0b4747]  break-keep
              transform transition-all duration-500 ease-in-out
              ${
                isAnimating
                  ? "opacity-0 scale-95 rotate-1 blur-sm translate-y-4"
                  : "opacity-100 scale-100 rotate-0 blur-0 translate-y-0"
              }
            `}
          >
            {currentDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraphDescription;
