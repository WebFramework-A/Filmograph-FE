import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from "framer-motion";
import { auth, db } from "../../../services/firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

interface FavoriteButtonProps {
  movieId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ movieId, size = 'md' }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const user = auth.currentUser;

  const getDocRef = () =>
    doc(db, "userWishlist", user!.uid, "items", movieId);

  // 로그인 여부 + Firestore 찜 여부 불러오기
  useEffect(() => {
    if (!user) {
      setFavorite(false);
      return;
    }

    async function fetchFavorite() {
      const snap = await getDoc(getDocRef());
      setFavorite(snap.exists());
    }

    fetchFavorite();
  }, [movieId, user]);

  // 토글 함수
  const toggleFavorite = async () => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      if (favorite) {
        await deleteDoc(getDocRef());
        setFavorite(false);
      } else {
        await setDoc(getDocRef(), {
          movieId,
          createdAt: new Date().toISOString(),
        });
        setFavorite(true);
      }
    } catch (error) {
      console.error("favorite error:", error);
      alert("찜 처리 중 오류가 발생했습니다.");
    }
  };

  // 버튼 크기
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
  );
}
