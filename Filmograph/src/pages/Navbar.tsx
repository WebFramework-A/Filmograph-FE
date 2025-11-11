import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-200 ${isActive ? "text-[#34C3F1] font-bold" : "text-white hover:text-gray-300"
    }`;

  return (
    <nav className="flex items-center gap-6 px-8 py-4 bg-black/50 text-white sticky top-0 z-50 backdrop-blur-sm">
      {/* 로고나 홈 링크가 있다면 여기에 추가 */}
      <NavLink to="/" className="text-xl font-bold mr-auto">
        Filmograph
      </NavLink>

      {/* 네비게이션 링크들 */}
      <div className="flex gap-6">
        <NavLink to="/" className={navLinkClasses} end>
          홈
        </NavLink>
        <NavLink to="/graph" className={navLinkClasses}>
          그래프 탐색
        </NavLink>
        <NavLink to="/detail" className={navLinkClasses}>
          상세 페이지 (임시)
        </NavLink>
        <NavLink to="/archetype" className={navLinkClasses}>
          아키타입
        </NavLink>
        <NavLink to="/my" className={navLinkClasses}>
          마이페이지
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;