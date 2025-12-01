import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../services/data/firebaseConfig";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../common/Toast";
import { calculateUserLevel } from "../../utils/levelUtils";

interface FavoriteButtonProps {
  movieId: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ movieId, size = "md" }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [user] = useAuthState(auth);
  const { toast, showToast } = useToast();

  function getDocRef() {
    if (!user) return null;
    return doc(db, "userWishlist", user.uid, "items", movieId);
  }

  // Firestore 찜 여부 가져오기
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

  const toggleFavorite = async () => {
    if (!user) {
      showToast("로그인 후 이용 가능합니다.", "로그인", "/login");
      return;
    }

    try {
      // -트랜잭션으로 찜 상태 변경 + 유저 카운트/레벨 업데이트 동시에 처리
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const wishRef = doc(db, "userWishlist", user.uid, "items", movieId);

        const userDoc = await transaction.get(userRef);
        const wishDoc = await transaction.get(wishRef);

        const userData = userDoc.exists() ? userDoc.data() : {};
        const currentReviewCount = userData.reviewCount || 0;
        const currentLikeCount = userData.likeCount || 0;

        let newLikeCount = currentLikeCount;

        if (wishDoc.exists()) {
          // 이미 찜한 상태 -> 삭제 (Unlike)
          transaction.delete(wishRef);
          newLikeCount = Math.max(0, currentLikeCount - 1);
        } else {
          // 찜 안한 상태 -> 추가 (Like)
          transaction.set(wishRef, {
            movieId,
            createdAt: new Date().toISOString(),
          });
          newLikeCount = currentLikeCount + 1;
        }

        // 레벨 재계산
        const newLevel = calculateUserLevel(currentReviewCount, newLikeCount);

        // 유저 정보 업데이트 (찜 카운트 + 레벨)
        transaction.update(userRef, {
          likeCount: newLikeCount,
          level: {
            level: newLevel.level,
            name: newLevel.name,
            color: newLevel.color
          }
        });
      });

      // 트랜잭션 성공 후 UI 상태 반전
      setFavorite((prev) => !prev);

    } catch (error) {
      console.error("favorite error:", error);
      showToast("찜 처리 중 오류가 발생했습니다.");
    }
  };

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
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${favorite
          ? "bg-white/10 text-[#FFFF00]"
          : "bg-white/10 text-white hover:bg-white/20"
          }`}
      >
        <Bookmark
          className={`${iconSizes[size]} transition-all ${favorite ? "fill-[#FFFF00]" : "fill-none"
            }`}
        />
      </motion.button>

      <Toast
        message={toast.message}
        show={toast.show}
        actionUrl={toast.actionUrl}
        actionLabel={toast.actionLabel}
        onClose={() => { }}
      />
    </>
  );
}
