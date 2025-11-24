import { useState } from "react";
import { signUpWithEmail } from "../services/authApi";
import { useNavigate } from "react-router-dom";

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
            window.location.reload();   //대비하여 새로고침

        }

        catch (error: any) {
            alert("회원가입 실패: " + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4">회원가입</h2>
            <input
                className="border p-2 rounded"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                className="border p-2 rounded"
                type="password"
                placeholder="비밀번호 (6자리 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
            />
            <input
                className="border p-2 rounded"
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
            />

            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                type="submit"
            >
                가입하기
            </button>
        </form>
    );
}