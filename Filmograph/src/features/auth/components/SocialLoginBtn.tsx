import { loginWithGoogle } from "../services/authApi";
import { useNavigate } from "react-router-dom";

export default function SocialLoginBtn() {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            alert("구글 로그인 성공!");
            // 메인 페이지로 이동
            navigate("/");
        }
        catch (error) {
            console.error(error);
            alert("구글 로그인에 실패했습니다.");
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="bg-[#4285F4] text-white border-none p-2.5 rounded w-full font-medium hover:bg-[#357ae8] transition-colors flex justify-center items-center gap-2"
        >
            Google로 시작하기
        </button>
    );
}