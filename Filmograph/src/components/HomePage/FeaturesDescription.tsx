import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../common/ScrollReveal";

interface FeatureData {
  id: number;
  category: string;
  title: React.ReactNode;
  description: React.ReactNode;
  themeColor: string;
  bgColor: string;
  imageUrl?: string;
  url: string;
}

interface FeatureSlideProps {
  data: FeatureData;
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const featuresData = [
  {
    id: 1,
    category: "BoxOffice",
    title: (
      <>
        "Daily
        <br />
        BoxOffice"
        <br />
        - 일간
        <br />
        랭킹 Top 5
      </>
    ),
    description:
      "한국 영화진흥위원회(Kobis)와 TMDB api를 기반으로 한 일간 박스오피스 순위를 확인해보세요. 오늘의 Top 5 영화를 보여줍니다.",
    themeColor: "text-blue-400",
    bgColor: "bg-blue-400",
    imageUrl: "/home/WeeklyTrend.png",
    url: "/BoxOffice",
  },
  {
    id: 2,
    category: "BoxOffice",
    title: (
      <>
        “Daily
        <br />
        BoxOffice"
        <br />
        - 주간
        <br />
        관람객 추이
        <br />
      </>
    ),
    description:
      "한국 영화진흥위원회(Kobis) Api를 기반으로 한 주간 박스오피스 순위를 확인해보세요. 지난 7일간의 관람객 추이를 보여줍니다.",
    themeColor: "text-orange-400",
    bgColor: "bg-orange-400",
    imageUrl: "/home/DailyTrend.png",
    url: "/boxOfficeTrend",
  },

  {
    id: 3,
    category: "BoxOffice",
    title: (
      <>
        "World Map
        <br />
        Trending Movies"
        <br />
        – 국가별
        <br />
        상영 1위
      </>
    ),
    description: (
      <>TMDB api를 기반으로 한 국가별 현재 인기 1위 영화를 알아보세요.</>
    ),
    themeColor: "text-purple-400",
    bgColor: "bg-purple-400",
    imageUrl: "/home/WorldTrend.png",
    url: "/map",
  },
];

const FeatureSlide: React.FC<FeatureSlideProps> = ({
  data,
  currentIndex,
  total,
  onNext,
  onPrev,
}) => {
  const navigate = useNavigate();

  return (
    <div className="snap-start w-full min-h-screen relative bg-[#0b4747] text-[#f0f0f0] overflow-hidden font-sans">
      <ScrollReveal direction="left">
        <h1 className="px-5 md:px-10 pt-[10%] sm:pt-[15%] md:pt-[10%] lg:pt-[8%] xl:pt-[5%] text-6xl sm:text-4xl md:text-5xl lg:text-6xl  text-yellow-300 border-b pb-2">
          More Features
        </h1>
      </ScrollReveal>
      {/* 공통 헤더 */}
      <header className="pt-[5%] w-full z-20 flex justify-between items-center px-4 md:px-6 lg:px-8 md:pt-6 text-xs md:text-sm font-medium backdrop-blur-sm">
        <div className={`flex items-center space-x-2 ${data.themeColor}`}>
          <span className={`w-2 h-2 rounded-full ${data.bgColor}`}></span>
          <span className="hidden sm:inline">Discover # {data.category}</span>
          <span className="sm:hidden">{data.category}</span>
        </div>

        {/* 공통 헤더 (오른쪽 넘기는거) */}
        <div className="flex items-center space-x-3 md:space-x-6 mb-2">
          <span className="tabular-nums text-xs md:text-sm">
            {String(currentIndex + 1).padStart(3, "0")} /{" "}
            {String(total).padStart(3, "0")}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onPrev}
              className="px-2 py-1.5 md:pt-2 border border-white/20 rounded-full bg-yellow-300 text-black hover:bg-yellow-100 transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={14} className="md:w-4 md:h-4" />
            </button>
            <button
              onClick={onNext}
              className="p-1.5 md:p-2 border border-white/20 rounded-full bg-yellow-300 text-black hover:bg-yellow-100 transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowRight size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인컨텐츠 부분 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        {/* 좌측(타이틀) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 md:p-6 lg:p-8 lg:pl-12 lg:pr-8 h-full relative z-10">
          {/* 메인 타이틀 */}
          <motion.div
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 lg:mt-10 flex flex-col justify-center h-full max-h-[60vh]"
          >
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif leading-[1.1] tracking-tight">
              {data.title}
            </h1>
          </motion.div>

          {/* 하단 세부설명 */}
          <motion.div
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="py-3 md:pb-10 lg:pb-16 max-w-md text-xs md:text-sm lg:text-base text-gray-400 leading-relaxed"
          >
            <p>{data.description}</p>
          </motion.div>
        </div>

        {/* 우측 (이미지)) */}
        <div className="lg:col-span-7 relative h-[400px] md:h-[500px] lg:h-full w-full bg-[#1a1a1a] overflow-hidden mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${currentIndex}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-20%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 30,
                damping: 8,
                duration: 0.1,
              }}
              className="absolute inset-0"
            >
              <img
                src={data.imageUrl}
                alt={data.category}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-linear-to-l from-transparent via-transparent to-black/40 lg:to-transparent pointer-events-none" />

              <div
                className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-500 group cursor-pointer flex items-center justify-center"
                onClick={() => navigate(`${data.url}`)}
              >
                <div className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-4 py-2 md:px-6 md:py-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                  <span className="text-sm md:text-base">View Details</span>
                  <ArrowRight size={14} className="md:w-4 md:h-4" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FeaturesDescription = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuresData.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuresData.length) % featuresData.length
    );
  };

  return (
    <>
      {" "}
      <FeatureSlide
        data={featuresData[currentIndex]}
        currentIndex={currentIndex}
        total={featuresData.length}
        onNext={nextSlide}
        onPrev={prevSlide}
      />
    </>
  );
};

export default FeaturesDescription;
