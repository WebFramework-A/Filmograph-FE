import React from "react";
import { loginWithGoogle, logout } from "../features/auth/services/authApi";
import { useAuth } from "../features/auth/hooks/useAuth";

const Header = () => {
    // 커스텀 훅을 사용해 현재 로그인된 사용자 정보를 가져옴
    const { user, loading } = useAuth();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <header className="p-4 bg-gray-100 flex justify-between items-center">
            <h1 className="text-xl font-bold">Filmograph</h1>           {/*logo 자리*/}
            <div className="flex gap-4 items-center">
                {user ? (
                    // 로그인 상태일 때 보여줄 UI
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {/* user 객체 안에 프로필 사진(photoURL), 이름(displayName), 이메일(email) 등이 들어있습니다 */}
                        <img
                            src={user.photoURL || ""}
                            alt="프로필"
                            style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                        />
                        <span>{user.displayName}님 환영합니다!</span>
                        <button onClick={logout}>로그아웃</button>
                    </div>
                ) : (
                    // 로그아웃 상태일 때 보여줄 UI
                    // 아마 나중에 그냥 기본 user 이미지? 넣을 듯
                    <button onClick={loginWithGoogle}>구글 로그인</button>
                )}
            </div>
        </header>
    );
};

export default Header;