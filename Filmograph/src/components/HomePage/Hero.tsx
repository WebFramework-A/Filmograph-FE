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
              {/* 왼쪽 & 오른쪽 겹치는 부분에 블러처리용 오버레이 (나중에 손보기. 이거 왜 안되는거지;;) */}
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
