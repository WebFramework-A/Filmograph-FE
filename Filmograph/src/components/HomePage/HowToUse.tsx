import ScrollReveal from "../common/ScrollReveal";

const HowToUse = () => {
  return (
    <div className="w-full h-screen snap-start bg-yellow-200 text-[#0d5a5a] flex flex-col justify-center font-serif overflow-hidden">
      {/* How */}
      <ScrollReveal direction="left" delay="delay-200">
        <div className="w-full flex justify-start my-25 md:mb-32">
          <div className="border-b border-[#0d5a5a] pl-40 md:pl-30 lg:pl-70 xl:pl-100 pr-2 pb-2 md:pb-4">
            <h2 className="text-7xl md:text-8xl leading-none">How</h2>
          </div>
        </div>
      </ScrollReveal>

      {/* to use */}
      <ScrollReveal direction="right" delay="delay-700">
        <div className="w-full flex justify-end mb-24 md:mb-32 lg:mb-45">
          <div className="border-b border-[#0d5a5a] pr-40 md:pr-20 lg:pr-70 xl:pr-100 pl-2 pb-2 md:pb-4">
            <h2 className="text-7xl md:text-9xl leading-none text-right">
              to <span className="font-bold">use</span>
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* FilmoGraph  */}
      <ScrollReveal direction="up" delay="delay-1700">
        <div className="w-full">
          <div className="w-full h-px bg-[#0d5a5a]"></div>
          <h2 className="text-center text-6xl md:text-8xl py-4 md:py-6 leading-none">
            FilmoGraph?
          </h2>
          <div className="w-full h-px bg-[#0d5a5a]"></div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default HowToUse;
