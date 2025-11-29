import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { useEffect, useState, useRef, useCallback } from "react";

const HomeLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null); // 메인 스크롤 영역 참조

  const isHomePage = location.pathname === "/";
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // 스크롤 및 화면 크기 상태 체크 함수
  const checkScrollPosition = useCallback(() => {
    const scrollContainer = mainRef.current;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

    // 내용이 화면보다 짧거나 같으면 무조건 보여줌
    if (scrollHeight <= clientHeight) {
      setIsFooterVisible(true);
      return;
    }

    const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 20;

    setIsFooterVisible(isBottom);
  }, []);

  // 스크롤 초기화 및 즉시 상태 체크
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setTimeout(checkScrollPosition, 0);
  }, [location.pathname, checkScrollPosition]); // 경로 바뀔때마다

  // 스크롤 이벤트 & 리사이즈 이벤트 감지
  useEffect(() => {
    const scrollContainer = mainRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener("scroll", checkScrollPosition);

    // 화면 크기가 변하거나/그래프가 로딩되어 길이가 변할 때 감지
    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener("scroll", checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

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
        <div className="w-full min-h-full">
          <Outlet />
        </div>
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
