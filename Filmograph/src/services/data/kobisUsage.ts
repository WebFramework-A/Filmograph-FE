import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const USAGE_DOC = doc(db, "system", "kobisUsage");

const getToday = () => new Date().toISOString().slice(0, 10);

// 오늘의 호출 수 가져오기
export const getKobisCalls = async (): Promise<number> => {
  const snap = await getDoc(USAGE_DOC);
  const today = getToday();

  if (!snap.exists() || snap.data().date !== today) {
    await setDoc(USAGE_DOC, { date: today, calls: 0 });
    return 0;
  }
  return snap.data().calls ?? 0;
};

// 호출 수 증가
export const countKobisCall = async (): Promise<number> => {
  const snap = await getDoc(USAGE_DOC);
  const today = getToday();

  let current = 0;

  if (!snap.exists() || snap.data().date !== today) {
    current = 1;
    await setDoc(USAGE_DOC, { date: today, calls: current });
  } else {
    current = (snap.data().calls ?? 0) + 1;
    await setDoc(
      USAGE_DOC,
      { date: today, calls: current },
      { merge: true }
    );
  }

  return current;
};
