import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../../services/auth/authApi";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Firebase Authentication에 사용자 생성
      await signUpWithEmail({ email, password, nickname });

      alert(`회원가입 성공! 환영합니다, ${nickname}님.`);

      //로그인 페이지로 이동
      navigate("/login");
      window.location.reload(); //대비하여 새로고침
    } catch (error: any) {
      alert("회원가입 실패: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        className="border p-2 rounded-lg border-[#0d5a5a]"
        type="text"
        placeholder="이름"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded-lg border-[#0d5a5a]"
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded-lg border-[#0d5a5a]"
        type="password"
        placeholder="비밀번호 (6자리 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      <button
        className="bg-[#0d5a5a] text-white py-2 px-4 rounded hover:bg-[#093c3c] cursor-pointer transition-colors"
        type="submit"
      >
        가입하기
      </button>
    </form>
  );
}
