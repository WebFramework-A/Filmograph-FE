import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { logout } from "../features/auth/services/authApi";

const Navbar = () => {
  // 만들어둔 사용자 인증관련 커스텀훅으로 회원 정보 가져오기
  const { user, loading } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-200 ${
      isActive ? "text-yellow-300 " : "text-white hover:text-yellow-300"
    }`;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-8 py-4 bg-black/10 backdrop-blur-lg  text-white tracking-wider transition-all duration-300">
      {/* 로고 */}
      <NavLink to="/" className="text-xl font-bold mr-auto">
        Filmograph
      </NavLink>

      {/* 네비게이션 링크들 */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className={navLinkClasses} end>
          Home
        </NavLink>
        <NavLink to="/graph" className={navLinkClasses}>
          Graph
        </NavLink>
        <NavLink to="/detail" className={navLinkClasses}>
          상세 페이지 (임시)
        </NavLink>
        <NavLink to="/archetype" className={navLinkClasses}>
          Archetype
        </NavLink>

        {/* 인증 영역 (로딩, 로그인, 로그아웃 상태에 따라 UI 변경) */}
        {loading ? (
          // 로딩 중일 때: 스켈레톤 UI
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        ) : user ? (
          // 로그인 상태일 때
          <>
            <NavLink to="/my" title="마이페이지">
              <img
                src={user.photoURL || "/default-avatar.png"} // 구글 프로필 사진 또는 기본 아바타
                alt="마이페이지"
                className="w-8 h-8 rounded-full hover:ring-2 hover:ring-[#34C3F1] transition-all"
              />
            </NavLink>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          // 로그아웃 상태일 때
          <Link to="/login" title="로그인 / 회원가입">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
              {/* 기본 사용자 아이콘 (SVG) */}
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
