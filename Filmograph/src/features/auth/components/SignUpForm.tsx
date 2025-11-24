import { useState } from "react";
import { signUpWithEmail } from "../services/authApi";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Firebase Authentication에 사용자 생성
            const user = await signUpWithEmail({ email, password, nickname });

            alert(`회원가입 성공! 환영합니다, ${nickname}님.`);
        }
        catch (error: any) {
            alert("회원가입 실패: " + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h2>회원가입</h2>
            <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="비밀번호 (6자리 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
            />
            <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
            />
            <button type="submit">가입하기</button>
        </form>
    );
}