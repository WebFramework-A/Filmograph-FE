import { Timestamp } from "firebase/firestore";

// DB에 저장될 리뷰 데이터 구조
export interface Review {
    id: string;
    userId: string;
    movieId: string;
    movieTitle: string;
    content: string;
    rating: number;
    createdAt: Timestamp; // Firestore Timestamp 타입 사용
    updatedAt: Timestamp;
    isAnonymous?: boolean; // 익명 여부
    userInfo?: {
        nickname: string;
        photoURL?: string;
    };
}

// 리뷰 작성 함수에 전달할 입력 데이터 타입 (편의상 정의)
export interface CreateReviewDTO {
    userId: string;
    movieId: string;
    movieTitle: string;
    content: string;
    rating: number;
    isAnonymous?: boolean; // 익명 여부
    userInfo: {
        nickname: string;
        photoURL?: string;
    };
}

//리뷰 수정시 이용할 데이터
export interface UpdateReviewDTO {
    reviewId: string;
    movieId: string;
    content: string;
    rating: number;
    oldRating: number;
    isAnonymous: boolean;
    userInfo: { // 닉네임 업데이트용 (익명 전환 시 필요)
        nickname: string;
        photoURL?: string;
    };
}