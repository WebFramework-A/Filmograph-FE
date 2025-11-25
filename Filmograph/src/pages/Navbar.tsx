import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { logout } from "../features/auth/services/authApi";
// useState는 더 이상 필요하지 않습니다 (CSS group-hover 사용)

const Navbar = () => {
  const { user, loading } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-yellow-300 "
        : "text-white hover:text-yellow-300 duration-400"
    }`;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-8 py-4 bg-black/10 backdrop-blur-lg text-white tracking-wider transition-all duration-400">
      <NavLink
        to="/"
        className="text-xl font-bold mr-auto hover:text-yellow-300 duration-300"
      >
        Filmograph
      </NavLink>

      <div className="flex items-center gap-6">
        <NavLink to="/" className={navLinkClasses} end>
          Home
        </NavLink>

        {/* Graph 메뉴 */}
        <div className="relative group h-full flex items-center">
          <NavLink to="/graph" className={navLinkClasses}>
            Graph
          </NavLink>

          {/* 드롭다운 메뉴 컨테이너 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-32
            opacity-0 invisible -translate-y-2.5
            group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
            transition-all duration-300 ease-out"
          >
            {/* 드롭다운 메뉴 3개 */}
            <div className="bg-black/80 backdrop-blur-md rounded-md shadow-lg py-2 flex flex-col gap-1 border border-white/10 overflow-hidden">
              <Link
                to="/graph/movie"
                className="px-4 py-2 hover:bg-white/10 hover:text-yellow-300 text-sm text-center transition-colors"
              >
                영화 & 영화인
              </Link>
              <Link
                to="/graph/ego"
                className="px-4 py-2 hover:bg-white/10 hover:text-yellow-300 text-sm text-center transition-colors"
              >
                에고 네트워크
              </Link>
              <Link
                to="/graph/collaboration"
                className="px-4 py-2 hover:bg-white/10 hover:text-yellow-300 text-sm text-center transition-colors"
              >
                협업 네트워킹
              </Link>
            </div>
          </div>
        </div>

        <NavLink to="/archetype" className={navLinkClasses}>
          Archetype
        </NavLink>

        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        ) : user ? (
          <>
            <div className="flex items-center gap-4">
              <NavLink
                to="/my"
                title="마이페이지"
                className={({ isActive }) =>
                  `block rounded-full p-0.5 transition-all ${
                    isActive ? "ring-2 ring-yellow-200 duration-500" : ""
                  }`
                }
              >
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="마이페이지"
                  className="w-8 h-8 rounded-full hover:ring-2 hover:ring-yellow-300 transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              </NavLink>

              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm rounded text-white font-semibold hover:text-yellow-300 transition-colors duration-500"
              >
                로그아웃
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" title="로그인 / 회원가입">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
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
