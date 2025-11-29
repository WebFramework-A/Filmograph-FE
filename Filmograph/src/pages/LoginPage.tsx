import { useState } from "react";
import LoginForm from "../components/LoginPage/LoginForm";
import SignUpForm from "../components/LoginPage/SignUpForm";

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true); // true면 로그인, false면 회원가입

  return (
    <div className="min-h-screen p-60 bg-[#0b4747] border flex justify-center items-center">
      <div className="w-[40%]  rounded-2xl px-10 py-15 bg-yellow-100/80 shadow-2xl">
        {/* 상단에 버튼2개 (로그인/회원가입) */}
        <div className="flex mb-5">
          <button
            className={`flex-1 py-2 text-center cursor-pointer ${
              isLoginMode
                ? "font-bold border-b-2 border-[#0d5a5a]"
                : "text-gray-500"
            }`}
            onClick={() => setIsLoginMode(true)}
          >
            로그인
          </button>
          <button
            className={`flex-1 py-2 text-center cursor-pointer ${
              !isLoginMode
                ? "font-bold border-b-2 border-[#0d5a5a]"
                : "text-gray-500"
            }`}
            onClick={() => setIsLoginMode(false)}
          >
            회원가입
          </button>
        </div>

        {/* 하단에 로그인/회원가입 모달 */}
        {isLoginMode ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
