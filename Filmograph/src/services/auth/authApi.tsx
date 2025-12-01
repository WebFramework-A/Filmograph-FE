import { auth, db } from "../data/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore 함수 임포트
import type { LoginCredentials, SignUpCredentials } from "../../types/authType";

const googleProvider = new GoogleAuthProvider();

//구글 로그인 (자동 회원가입 포함)
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Firestore에 유저 정보가 있는지 확인
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // 없다면 새로 생성 (구글 로그인으로 처음 들어온 경우)
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        nickname: user.displayName || "익명 사용자",
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        likedMovies: [], // 빈 배열로 초기화
      });
    }

    return user;
  } catch (error) {
    console.error("구글 로그인 에러:", error);
    throw error;
  }
};

//이메일 회원가입
export const signUpWithEmail = async ({
  email,
  password,
  nickname,
}: SignUpCredentials): Promise<User> => {
  try {
    //Authentication에 유저 생성
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Firestore 'users' 컬렉션에 문서 생성
    // 문서 ID를 user.uid와 똑같이 설정
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      nickname: nickname, // 입력받은 닉네임 저장
      photoURL: null,
      createdAt: new Date().toISOString(),
      likedMovies: [], // 찜 목록 빈 배열로 초기화
    });

    return user;
  } catch (error) {
    console.error("회원가입 에러:", error);
    throw error;
  }
};

// 이메일 로그인
export const loginWithEmail = async ({
  email,
  password,
}: LoginCredentials): Promise<User> => {
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
