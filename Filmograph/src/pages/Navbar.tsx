import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { logout } from "../features/auth/services/authApi";

const Navbar = () => {
  //현재 로그인 상태와 사용자 정보를 가져옴.
  const { user, loading } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-200 ${isActive ? "text-[#34C3F1] font-bold" : "text-white hover:text-gray-300"
    }`;

  return (
    <nav className="flex items-center gap-6 px-8 py-4 bg-black/50 text-white sticky top-0 z-50 backdrop-blur-sm">
      {/*로고 (mr-auto로 왼쪽 정렬) */}
      <NavLink to="/" className="text-xl font-bold mr-auto">
        Filmograph
      </NavLink>

      {/* 네비게이션 링크들 */}
      <div className="flex items-center gap-6">
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

        {/*인증 영역 (로딩, 로그인, 로그아웃 상태에 따라 UI 변경) */}
        {loading ? (
          // 로딩 중일 때: 스켈레톤 UI
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        ) : user ? (
          //로그인 상태일 때
          <>
            <div className="flex items-center gap-4">
              {/*프로필 사진 클릭 -> 마이페이지 이동*/}
              <NavLink
                to="/my"
                title="마이페이지"
                className={({ isActive }) =>
                  `block rounded-full p-0.5 transition-all ${isActive ? "ring-2 ring-[#34C3F1]" : "hover:ring-2 hover:ring-white/50"}`
                }
              >
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
            </div>
          </>
        ) : (
          //로그아웃 상태일 때 (요청하신 기본 사용자 아이콘)
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