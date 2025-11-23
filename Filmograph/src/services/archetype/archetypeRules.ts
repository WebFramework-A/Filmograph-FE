// src/services/archetype/archetypeRules.ts
import type { ArchetypeId, Character } from "./archetypeTypes";

export type ArchetypeRule = {
  id: ArchetypeId;
  name: string;        // 화면에 보여줄 이름 (한글)
  description: string; // 잡지형 설명 문구
  keywords: string[];  // 분류에 사용할 키워드들
};

export const ARCHETYPE_RULES: ArchetypeRule[] = [
  {
    id: "HERO",
    name: "히어로",
    description:
      "위기에서 앞장서고, 자신을 희생해 타인을 구하려는 중심 인물. 정의와 책임감을 중심으로 이야기를 이끄는 주인공형 캐릭터.",
    keywords: [
      "주인공",
      "영웅",
      "정의",
      "희생",
      "용기",
      "구하다",
      "리더",
      "책임",
      "도와",
      "보호",
    ],
  },
  {
    id: "VILLAIN",
    name: "악당",
    description:
      "욕망과 권력, 집착을 따라 움직이며 주인공과 대립하는 인물. 파괴·지배·조종을 통해 갈등을 만들어내는 빌런형 캐릭터.",
    keywords: [
      "악당",
      "빌런",
      "범죄",
      "지배",
      "권력",
      "파괴",
      "잔인",
      "냉혹",
      "야망",
      "조종",
      "부패",
      "타락",
    ],
  },
  {
    id: "AVENGER",
    name: "복수귀",
    description:
      "상처와 트라우마를 안고, 잃어버린 것에 대한 복수를 목표로 움직이는 인물. 분노와 원한이 행동의 동력이 되는 캐릭터.",
    keywords: [
      "복수",
      "원한",
      "되갚",
      "복수심",
      "분노",
      "복수극",
      "피해자",
      "가해자",
      "응징",
      "처벌",
      "복수의",
    ],
  },
  {
    id: "OUTSIDER",
    name: "아웃사이더",
    description:
      "집단에 속하지 못하고 겉도는 인물. 소외감과 고독을 안고 있지만, 그만의 시각과 감수성으로 이야기에 균열을 만드는 타입.",
    keywords: [
      "소외",
      "왕따",
      "외톨이",
      "고독",
      "이방인",
      "부적응",
      "낙오자",
      "무리에서",
      "겉도",
      "아웃사이더",
      "혼자",
      "외로운",
    ],
  },
  {
    id: "BRAIN",
    name: "브레인",
    description:
      "지능과 분석, 계획으로 문제를 해결하는 두뇌형 인물. 직접 싸우기보다 전략·설계·정보로 판을 움직이는 전략가 타입.",
    keywords: [
      "천재",
      "머리",
      "두뇌",
      "전략",
      "계획",
      "분석",
      "계산",
      "지능",
      "똑똑",
      "설계",
      "작전",
      "계산적",
    ],
  },
  {
    id: "EXPLORER",
    name: "탐험가",
    description:
      "익숙한 곳을 떠나 새로운 세계와 경계를 향해 나아가는 인물. 모험과 발견, 변화를 두려워하지 않는 타입.",
    keywords: [
      "모험",
      "탐험",
      "여행",
      "여정",
      "항해",
      "발견",
      "새로운 세계",
      "경계 밖",
      "떠나",
      "길 위",
      "방랑",
      "자유로운",
    ],
  },
  {
    id: "CANDY",
    name: "캔디",
    description:
      "밝고 긍정적인 에너지로 주변 분위기를 환하게 만드는 인물. 상처가 있어도 특유의 낙천성과 애정으로 사람들을 끌어당기는 타입.",
    keywords: [
      "밝다",
      "긍정",
      "해맑",
      "상큼",
      "엉뚱",
      "귀엽",
      "러블리",
      "웃음",
      "분위기 메이커",
      "따뜻",
      "애정",
      "다정",
    ],
  },
  {
    id: "MAGE",
    name: "마법사",
    description:
      "세계의 규칙과 비밀을 이해하고, 주인공을 이끌거나 시험하는 지혜로운 인물. 실제 마법을 쓰지 않아도 멘토·조언자 역할을 한다면 이 타입.",
    keywords: [
      "마법",
      "주술",
      "예언",
      "예지",
      "지혜",
      "스승",
      "멘토",
      "조언",
      "가르치",
      "지도",
      "규칙",
      "세계관",
      "비밀",
      "수호",
    ],
  },
  {
    id: "SPY",
    name: "스파이",
    description:
      "보이지 않는 곳에서 움직이며 진실과 거짓 사이를 넘나드는 정보의 그림자. 임무와 위장, 침투와 조작으로 세계를 흔드는 은밀한 전략가.",
    keywords: [
      "스파이",
      "첩보",
      "비밀",
      "비밀요원",
      "요원",
      "암호",
      "작전",
      "임무",
      "침투",
      "잠입",
      "위장",
      "은밀",
      "스텔스",
      "첩자",
      "이중",
      "첩보원",
      "정보",
      "비공개",
      "지령",
      "첩보기관",
    ],
  },
];

// 캐릭터 하나를 규칙으로 분류
export function classifyCharacterByRules(character: Character) {
  const text = character.description.toLowerCase();

  let bestId: ArchetypeId = "HERO";
  let bestScore = -1;

  for (const rule of ARCHETYPE_RULES) {
    let score = 0;

    for (const keyword of rule.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = rule.id;
    }
  }

  return {
    archetypeId: bestId,
    archetypeScore: bestScore,
  };
}

// 여러 캐릭터 한 번에 분류
export function classifyCharacters(characters: Character[]): Character[] {
  return characters.map((c) => {
    const result = classifyCharacterByRules(c);
    return { ...c, ...result };
  });
}
