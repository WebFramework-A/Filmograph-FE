export interface LevelCriteria {
    minReviews: number;
    minLikes: number;
}

export interface LevelDefinition {
    level: number;
    name: string;
    color: string; // 배지 색상 등
    criteria: LevelCriteria;
}

// 레벨 정의 (5단계) 조건 설정
export const LEVEL_SYSTEM: LevelDefinition[] = [
    {
        level: 1,
        name: "비기너",
        color: "#E0E0E0", // 회색
        criteria: { minReviews: 0, minLikes: 0 },
    },
    {
        level: 2,
        name: "무비 매니아",
        color: "#4FC3F7", // 하늘색
        criteria: { minReviews: 5, minLikes: 10 },
    },
    {
        level: 3,
        name: "평론가",
        color: "#FFD700", // 골드
        criteria: { minReviews: 15, minLikes: 30 },
    },
    {
        level: 4,
        name: "시네필",
        color: "#FF6B6B", // 붉은색
        criteria: { minReviews: 30, minLikes: 60 },
    },
    {
        level: 5,
        name: "마스터",
        color: "#E040FB", // 보라색
        criteria: { minReviews: 50, minLikes: 100 },
    },
];

// 현재 레벨 계산 함수
export const calculateUserLevel = (reviewCount: number, likeCount: number) => {
    // 조건을 만족하는 가장 높은 레벨을 찾음 (역순 탐색)
    for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
        const lvl = LEVEL_SYSTEM[i];
        if (reviewCount >= lvl.criteria.minReviews && likeCount >= lvl.criteria.minLikes) {
            return lvl;
        }
    }
    return LEVEL_SYSTEM[0]; // 기본 비기너
};

// 다음 레벨까지 남은 수치와 퍼센트 계산
export const getNextLevelProgress = (currentLevelVal: number, reviewCount: number, likeCount: number) => {
    const nextLevel = LEVEL_SYSTEM.find((l) => l.level === currentLevelVal + 1);

    if (!nextLevel) {
        return null; // 만렙 도달
    }

    // 남은 개수 (음수가 되지 않도록 처리)
    const reviewsLeft = Math.max(0, nextLevel.criteria.minReviews - reviewCount);
    const likesLeft = Math.max(0, nextLevel.criteria.minLikes - likeCount);

    const totalMin = Math.max(0, nextLevel.criteria.minLikes + nextLevel.criteria.minReviews);
    const totalCount = Math.max(0, reviewCount + likeCount);

    /*
    // 개별 퍼센트 계산 
    const reviewProgress = Math.min(100, (reviewCount / nextLevel.criteria.minReviews) * 100);
    const likeProgress = Math.min(100, (likeCount / nextLevel.criteria.minLikes) * 100);
    */

    // 전체 진행률
    const totalProgress = Math.floor((totalCount / totalMin) * 100);

    return {
        nextLevelName: nextLevel.name,
        reviewsLeft,
        likesLeft,
        totalProgress,
        targetReviews: nextLevel.criteria.minReviews,
        targetLikes: nextLevel.criteria.minLikes
    };
};