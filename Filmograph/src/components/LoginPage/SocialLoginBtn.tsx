import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../../services/auth/authApi";

export default function SocialLoginBtn() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("구글 로그인에 실패했습니다.");
    }
  };

  return (
    <button
      type="button"
      disabled={false}
      onClick={handleGoogleLogin}
      className="w-full text-white bg-[#0d5a5a] hover:bg-[#093c3c] p-2 rounded-md transition-colors cursor-pointer  disabled:bg-gray-900 disabled:cursor-not-allowed flex items-center justify-center relative"
    >
      <img
        src="https://img.icons8.com/color/512/google-logo.png"
        className="w-6 h-6 absolute left-4"
      ></img>
      구글 로그인
    </button>
  );
}
