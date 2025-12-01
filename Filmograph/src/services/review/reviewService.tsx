import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import type { CreateReviewDTO, UpdateReviewDTO } from "../../types/review";
import { calculateUserLevel } from "../../utils/levelUtils";

// 리뷰 작성 및 데이터 동기화 함수
export const addReview = async ({
    userId,
    movieId,
    movieTitle,
    content,
    rating,
    isAnonymous,
    userInfo
}: CreateReviewDTO) => {
    try {
        await runTransaction(db, async (transaction) => {
            // 참조 가져오기
            const movieRef = doc(db, "movies", movieId);
            const userRef = doc(db, "users", userId);
            const newReviewRef = doc(collection(db, "reviews")); // 새 문서 ID 자동 생성

            // 현재 데이터 읽기 (트랜잭션 내 필수)
            const movieDoc = await transaction.get(movieRef);
            const userDoc = await transaction.get(userRef);

            if (!movieDoc.exists()) {
                throw new Error("존재하지 않는 영화입니다.");
            }

            // 영화 평점 재계산
            const movieData = movieDoc.data();
            const currentRatingCount = movieData.ratingCount || 0;
            const currentAvgRating = movieData.avgRating || 0;

            const newRatingCount = currentRatingCount + 1;
            const newAvgRating = ((currentAvgRating * currentRatingCount) + rating) / newRatingCount;

            // 등급을 위해 가져오기
            const userData = userDoc.exists() ? userDoc.data() : {};
            const currentReviewCount = userData.reviewCount || 0;   //리뷰
            const currentLikeCount = userData.likeCount || 0;       //찜

            const newReviewCount = currentReviewCount + 1;

            // 새 레벨 계산
            const newLevel = calculateUserLevel(newReviewCount, currentLikeCount);

            // --- [쓰기 작업] ---
            transaction.set(newReviewRef, {
                id: newReviewRef.id,
                userId,
                movieId,
                movieTitle,
                content,
                rating,
                isAnonymous,
                userInfo,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 영화 평점
            transaction.update(movieRef, {
                avgRating: newAvgRating,
                ratingCount: newRatingCount,
            });

            // 유저 리뷰 수 및 레벨 업데이트
            transaction.update(userRef, {
                reviewCount: newReviewCount,
                level: { // 레벨 객체 통째로 저장 (또는 필요한 필드만)
                    level: newLevel.level,
                    name: newLevel.name,
                    color: newLevel.color
                }
            });
        });

        console.log("리뷰 작성 성공!");
        return true;

    } catch (error) {
        console.error("리뷰 작성 실패:", error);
        throw error;
    }
};

//리뷰 업데이트
export const updateReview = async ({
    reviewId,
    movieId,
    content,
    rating,
    oldRating,
    isAnonymous,
    userInfo
}: UpdateReviewDTO) => {
    try {
        await runTransaction(db, async (transaction) => {
            const movieRef = doc(db, "movies", movieId);
            const reviewRef = doc(db, "reviews", reviewId);
            const movieDoc = await transaction.get(movieRef);

            if (!movieDoc.exists()) throw new Error("영화 정보 없음");

            const movieData = movieDoc.data();
            const currentRatingCount = movieData.ratingCount || 1;
            const currentAvgRating = movieData.avgRating || 0;

            // 평점 재계산: (총점 - 구점수 + 새점수) / 개수
            const oldTotalScore = currentAvgRating * currentRatingCount;
            const newTotalScore = oldTotalScore - oldRating + rating;
            const newAvgRating = newTotalScore / currentRatingCount;

            // 리뷰 문서 업데이트
            transaction.update(reviewRef, {
                content,
                rating,
                isAnonymous,
                // 익명이면 닉네임을 "익명"으로 덮어쓰고, 아니면 원래 닉네임 사용
                "userInfo.nickname": isAnonymous ? "익명" : userInfo.nickname,
                "userInfo.photoURL": isAnonymous ? "" : userInfo.photoURL, // 익명이면 프사 숨김
                updatedAt: serverTimestamp(),
            });

            // 영화 평점 업데이트
            transaction.update(movieRef, {
                avgRating: newAvgRating,
            });
        });
    } catch (error) {
        console.error("리뷰 수정 실패:", error);
        throw error;
    }
};

//리뷰 삭제하기
export const deleteReview = async (reviewId: string, movieId: string, userId: string, rating: number) => {
    try {
        await runTransaction(db, async (transaction) => {
            const movieRef = doc(db, "movies", movieId);
            const userRef = doc(db, "users", userId);
            const reviewRef = doc(db, "reviews", reviewId);

            const movieDoc = await transaction.get(movieRef);
            const userDoc = await transaction.get(userRef);

            // 영화 평점 재계산
            if (movieDoc.exists()) {
                const movieData = movieDoc.data();
                const currentRatingCount = movieData.ratingCount || 1;
                const currentAvgRating = movieData.avgRating || 0;

                // 리뷰가 1개뿐이었다면 0점으로 초기화, 아니면 역산
                if (currentRatingCount <= 1) {
                    transaction.update(movieRef, { avgRating: 0, ratingCount: 0 });
                } else {
                    const newRatingCount = currentRatingCount - 1;
                    const newAvgRating = ((currentAvgRating * currentRatingCount) - rating) / newRatingCount;
                    transaction.update(movieRef, {
                        avgRating: newAvgRating,
                        ratingCount: newRatingCount
                    });
                }
            }

            // 유저 리뷰 수 감소
            // 레벨 재계산 로직 추가
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentReviewCount = userData.reviewCount || 0;
                const currentLikeCount = userData.likeCount || 0;

                const newReviewCount = Math.max(0, currentReviewCount - 1);
                const newLevel = calculateUserLevel(newReviewCount, currentLikeCount);

                transaction.update(userRef, {
                    reviewCount: newReviewCount,
                    level: {
                        level: newLevel.level,
                        name: newLevel.name,
                        color: newLevel.color
                    }
                });
            }

            // 리뷰 문서 삭제
            transaction.delete(reviewRef);
        });
    }
    catch (error) {
        console.error("리뷰 삭제 실패:", error);
        throw error;
    }
};
