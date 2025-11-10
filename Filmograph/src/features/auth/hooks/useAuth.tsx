import { useState, useEffect } from "react";
import { auth } from "../../../services/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가 (초기화 전 깜빡임 방지)

  useEffect(() => {
    // Firebase가 제공하는 인증 상태 리스너
    // 사용자가 로그인하거나 로그아웃할 때마다 이 함수가 자동으로 실행됩니다.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 리스너 정리
    return () => unsubscribe();
  }, []);

  return { user, loading };
};