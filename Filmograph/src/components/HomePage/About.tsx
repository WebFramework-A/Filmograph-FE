import ScrollReveal from "../common/ScrollReveal";

const About = () => {
  return (
    <div className="w-full min-h-screen bg-[#0d5a5a] flex flex-col items-center snap-start">
      {/* About 위에 줄 */}
      <div className="w-px h-40 bg-yellow-200 mb-4 mt-20"></div>

      {/* About 타이틀 */}
      <h2 className="text-yellow-200 tracking-wider text-6xl mb-4">About</h2>

      {/* 줄 + 글자 영역 */}
      <div className="relative w-full max-w-4xl flex flex-col pb-20">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-yellow-200"></div>

        {/* 왼쪽 텍스트 */}
        <div className="w-full flex justify-start mt-40">
          <div className="w-1/2 pr-12 text-right">
            <ScrollReveal direction="left">
              <p className="text-yellow-100 text-xl font-light leading-relaxed">
                우리는 영화를 단순히
                <br />
                ‘보는’ 대상이 아닌
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="py-30"></div>

        {/* 오른쪽 텍스트 */}
        <div className="w-full flex justify-end">
          <div className="w-1/2 pl-12 text-left">
            <ScrollReveal direction="right" delay="delay-500">
              <p className="text-yellow-100 text-xl font-light leading-relaxed">
                ‘탐험하는’ 문화 네트워크로
                <br />
                바라봅니다
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="py-30"></div>

        {/* 아래 텍스트 */}
        <div className="w-full flex justify-center pt-20 pb-10">
          <div className="bg-[#0d5a5a] z-10 px-4 text-center">
            <ScrollReveal direction="up">
              <p className="text-yellow-100 text-lg py-3 font-light leading-relaxed">
                사용자가 직접 영화 세계를 탐구하고
                <br />
                해석할 수 있는 경험을 제공합니다.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <div className="py-40"></div>
      </div>
    </div>
  );
};

export default About;
