import { useState } from "react";
import { loginWithEmail } from "../services/authApi";
import SocialLoginBtn from "./SocialLoginBtn";
import { FirebaseError } from "firebase/app"; // FirebaseError 타입 임포트

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 🔥 Firebase 에러 코드를 한국어 메시지로 변환하는 함수
    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case "auth/invalid-credential":
                return "이메일이나 비밀번호가 일치하지 않습니다.";
            case "auth/too-many-requests":
                return "너무 많은 로그인 시도로 인해 잠시 차단되었습니다. 나중에 다시 시도해주세요.";
            default:
                return "로그인에 실패했습니다. 다시 시도해주세요.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginWithEmail({ email, password });
            alert("로그인 성공!");
            // TODO: 메인 페이지로 이동 (예: navigate('/'))
        } catch (error) {
            // 에러가 FirebaseError 타입인지 확인
            if (error instanceof FirebaseError) {
                const msg = getErrorMessage(error.code);
                alert(msg);
            } else {
                // Firebase 외의 알 수 없는 에러
                alert("알 수 없는 오류가 발생했습니다.");
                console.error("Login Unknown Error:", error);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4">로그인</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    type="submit"
                >
                    이메일로 로그인
                </button>
            </form>
            <hr className="my-4" />
            <SocialLoginBtn />
        </div>
    );
}