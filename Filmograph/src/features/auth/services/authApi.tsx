import { auth } from "../../../services/firebaseConfig"; // 경로 주의!
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";

import type { LoginCredentials, SignUpCredentials } from "../types/authType"; // 타입 정의 필요

const googleProvider = new GoogleAuthProvider();

// 구글 로그인
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("구글 로그인 에러:", error);
    throw error;
  }
};

// 이메일 회원가입
export const signUpWithEmail = async ({ email, password }: SignUpCredentials): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("회원가입 에러:", error);
    throw error;
  }
};

// 이메일 로그인
export const loginWithEmail = async ({ email, password }: LoginCredentials): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("이메일 로그인 에러:", error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 에러:", error);
  }
};