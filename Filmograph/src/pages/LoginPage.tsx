import { useState } from "react";
import LoginForm from "../features/auth/components/LoginForm";
import SignUpForm from "../features/auth/components/SignUpForm";

export default function LoginPage() {
    const [isLoginMode, setIsLoginMode] = useState(true); // true면 로그인, false면 회원가입

    return (
        <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded-lg">
            <div className="flex mb-6">
                <button
                    className={`flex-1 py-2 text-center ${isLoginMode ? "font-bold border-b-2 border-blue-500" : "text-gray-500"}`}
                    onClick={() => setIsLoginMode(true)}
                >
                    로그인
                </button>
                <button
                    className={`flex-1 py-2 text-center ${!isLoginMode ? "font-bold border-b-2 border-blue-500" : "text-gray-500"}`}
                    onClick={() => setIsLoginMode(false)}
                >
                    회원가입
                </button>
            </div>
            {isLoginMode ? <LoginForm /> : <SignUpForm />}
        </div>
    );
}