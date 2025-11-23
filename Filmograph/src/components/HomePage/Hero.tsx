import { useNavigate } from "react-router-dom";
import DecorativeGraph from "./DecorativeGraph";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full min-h-screen snap-start bg-[#0d5a5a] flex items-center justify-center px-8 relative overflow-hidden">
        <div className="w-full h-screen max-w-7xl relative flex items-center">
          {/* 왼쪽: 대표 문구 및 버튼 */}
          <div className="flex flex-col justify-center space-y-8 relative z-20 w-1/2">
            <h1 className="text-5xl font-bold text-[#FFD700] tracking-wider">
              Connect Movies,
              <br />
              Explore Worlds
            </h1>
            <p className="text-xl text-white/80">
              당신이 몰랐던 영화의 연결고리
            </p>

            {/* 시작하기 */}
            <div
              onClick={() => navigate("/graph")}
              className="w-fit cursor-pointer group"
            >
              <div className="flex flex-col w-full max-w-md">
                <h1 className="text-lg font-light text-yellow-100 mb-1 tracking-widest">
                  시작하기
                </h1>

                <div className="relative w-40 h-px bg-yellow-100 origin-left group-hover:animate-[slide_0.8s_ease-in-out_forwards]">
                  <div className="absolute right-0 bottom-0 w-4 h-px bg-yellow-100 origin-bottom-right -rotate-320"></div>
                </div>

                {/* (커스텀 애니메이션) 호버하면 화살표 애니메이션용  */}
                <style>
                  {`
                  @keyframes slide {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                  }
                `}
                </style>
              </div>
            </div>
          </div>

          {/* 오른쪽: 그래프 */}
          <div className="absolute right-0 top-0 h-full w-full md:w-[65%] flex items-center justify-center z-10 pointer-events-none">
            <div className="w-full h-[600px] flex items-center justify-center relative">
              {/* 왼쪽 & 오른쪽 겹치는 부분에 블러처리용 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backdropFilter: "blur(0px)",
                  WebkitBackdropFilter: "blur(0px)",
                  background:
                    "linear-gradient(to right, rgba(13, 90, 90, 0) 0%, rgba(13, 90, 90, 0) 40%, transparent 100%)",
                }}
              >
                <div
                  className="absolute inset-0"
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
              <DecorativeGraph />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
