import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../../services/firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "../../../hooks/useToast";
import { Toast } from "../../../components/common/Toast";

interface FavoriteButtonProps {
  movieId: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ movieId, size = "md" }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [user] = useAuthState(auth);
  const { toast, showToast } = useToast();

  // Firestore 경로
  function getDocRef() {
    if (!user) return null;
    return doc(db, "userWishlist", user.uid, "items", movieId);
  }

  // 로그인 상태 + Firestore 찜 여부 불러오기
  useEffect(() => {
    if (!user) {
      setFavorite(false);
      return;
    }

    async function fetchFavorite() {
      const ref = getDocRef();
      if (!ref) return;

      const snap = await getDoc(ref);
      setFavorite(snap.exists());
    }

    fetchFavorite();
  }, [movieId, user]);

  // 찜 토글
  const toggleFavorite = async () => {
    if (!user) {
      showToast("로그인 후 이용 가능합니다.", "로그인", "/login");
      return;
    }

    try {
      const ref = getDocRef();
      if (!ref) return;

      if (favorite) {
        await deleteDoc(ref);
        setFavorite(false);
      } else {
        await setDoc(ref, {
          movieId,
          createdAt: new Date().toISOString(),
        });
        setFavorite(true);
      }
    } catch (error) {
      console.error("favorite error:", error);
      showToast("찜 처리 중 오류가 발생했습니다.");
    }
  };

  // 버튼 크기 스타일
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFavorite}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
          favorite
            ? "bg-[#FFFF00] text-[#00696B]"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        <Bookmark
          className={`${iconSizes[size]} transition-all ${
            favorite ? "fill-[#00696B]" : "fill-none"
          }`}
        />
      </motion.button>

      {/* Toast UI */}
      <Toast
        message={toast.message}
        show={toast.show}
        actionUrl={toast.actionUrl}
        actionLabel={toast.actionLabel}
        onClose={() => {}}
      />
    </>
  );
}