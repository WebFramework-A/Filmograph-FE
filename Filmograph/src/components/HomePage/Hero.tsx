import { useNavigate } from "react-router-dom";
import DecorativeGraph from "./DecorativeGraph";
import Arrow from "../common/Arrow";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full min-h-screen snap-start bg-[#0b4747] flex items-center justify-center px-8 relative overflow-hidden">
        <div className="w-full h-screen max-w-7xl relative flex items-center">
          {/* 좌측 (랜딩문구, 시작버튼) */}
          <div className="flex flex-col justify-center space-y-8 relative z-20 w-1/2">
            <h1 className="text-5xl xl:text-7xl font-bold text-yellow-300 tracking-wider">
              Connect Movies,
              <br />
              Explore Worlds
            </h1>
            <p className="text-xl xl:text-2xl text-white/80">
              당신이 몰랐던 영화의 연결고리
            </p>

            <Arrow title="시작하기" onClick={() => navigate("/graph")} />
          </div>

          {/* 우측 (그래프) */}
          <div className="absolute right-0 top-0 h-full w-full md:w-[65%] flex items-center justify-center z-10 pointer-events-none">
            {/* 노드 움직이게끔 pointer-events-auto 추가함ㅜㅜ */}
            <div className="w-full h-full flex items-center justify-center relative pointer-events-auto">
              <DecorativeGraph />
              {/* 왼쪽 & 오른쪽 겹치는 부분에 블러처리용 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  maskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0) 40%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0) 40%)",
                }}
              />
            </div>
          </div>

          {/* 스크롤 표시 아이콘 (아래로 스크롤하라고 유도하는 용도) */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-2">
            <p className="text-white/60 text-sm">Scroll Down</p>
            <div className="animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
