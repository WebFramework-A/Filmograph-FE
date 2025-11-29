import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { useEffect, useState, useRef } from "react";

const HomeLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null); // 메인 스크롤 영역 참조

  const isHomePage = location.pathname === "/";
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // 경로가 바뀔 때마다 스크롤을 맨 위로 초기화하고 푸터 숨김
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsFooterVisible(false);
  }, [location.pathname]);

  // 스크롤 이벤트 감지 (모든 페이지 공통 적용)
  useEffect(() => {
    const scrollContainer = mainRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // 바닥 감지
      const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

      setIsFooterVisible(isBottom);
    };

    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const footerBgColor = "backdrop-blur-md";
  const footerTextColor = isHomePage ? "text-[#0d5a5a]" : "text-yellow-100";

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
      <Navbar />

      <main
        ref={mainRef}
        className={`
          w-full flex-1 overflow-x-hidden overflow-y-auto scroll-smooth
          ${isHomePage ? "snap-y snap-mandatory" : ""} 
          [&::-webkit-scrollbar]:hidden 
          [-ms-overflow-style:none] 
          [scrollbar-width:none]
          `}
      >
        <Outlet />
      </main>

      {/* 푸터 */}
      <div
        className={`
          fixed bottom-0 w-full z-50 
          transition-transform duration-300 ease-in-out 
          ${footerBgColor}
          ${isFooterVisible ? "translate-y-0" : "translate-y-full"} 
        `}
      >
        <Footer textColor={footerTextColor} />
      </div>
    </div>
  );
};

export default HomeLayout;
