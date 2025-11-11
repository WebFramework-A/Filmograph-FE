import { loginWithGoogle } from "../services/authApi";

export default function SocialLoginBtn() {
    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            alert("구글 로그인 성공!");
            //구현 예정: 메인 페이지로 이동
        }
        catch (error) {
            alert("구글 로그인에 실패했습니다.");
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            style={{ backgroundColor: "#4285F4", color: "white", border: "none", padding: "10px" }}
        >
            Google로 시작하기
        </button>
    );
}