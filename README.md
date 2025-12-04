# 🎬 Filmograph

> **"영화 데이터를 살아있는 네트워크로 탐험하다"**

`React 19`와 `Canvas API(D3.js)`를 활용하여, 영화인들의 복잡한 협업 관계를 시각화한 인터랙티브 웹 플랫폼입니다.

<br />

## 🚀 시작하기
```
# zip 폴더 압축 해제 후, 프로젝트 폴더로 이동
cd ./Filmograph-FE/Filmograph

# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

<br />


## 📅 프로젝트 개요

- **진행 기간:** 2025.10.30 ~ 2025.12.02
- **개발 목적:** 정적인 텍스트 목록 중심의 영화 정보 제공 방식에서 벗어나, **관계와 맥락** 중심의 새로운 탐색 경험을 제공하기 위해 진행하였습니다.


<br />


## 👥 팀 소개

| <img src="https://avatars.githubusercontent.com/u/160497134?v=4" alt="김민서" width="150"> | <img src="https://avatars.githubusercontent.com/u/190920292?v=4" alt="한국희" width="150"> | <img src="https://avatars.githubusercontent.com/u/232311799?v=4" alt="서유정" width="150"> | <img src="https://avatars.githubusercontent.com/u/146168416?v=4" alt="정민지" width="150"> |
|:---:|:---:|:---:|:---:|
| **[김민서](https://github.com/minseeeeo)** | **[한국희](https://github.com/rnrzl)** | **[서유정](https://github.com/wsenuz)** | **[정민지](https://github.com/mint0326)** |

<br/>

## 🛠️ 기술 스택

#### Core & Architecture
![React](https://img.shields.io/badge/React-19.1.1-555555?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-555555?style=flat-square&logo=typescript&logoColor=white&labelColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-7.1.7-555555?style=flat-square&logo=vite&logoColor=white&labelColor=646CFF)
![React Router](https://img.shields.io/badge/React_Router-7.9.5-555555?style=flat-square&logo=reactrouter&logoColor=white&labelColor=CA4245)

#### Data Visualization
![React Force Graph](https://img.shields.io/badge/React_Force_Graph-1.29.0-555555?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB)
![D3.js](https://img.shields.io/badge/D3.js-3.0.0-555555?style=flat-square&logo=d3.js&logoColor=white&labelColor=F9A03C)
![AmCharts](https://img.shields.io/badge/AmCharts-4.10.40-555555?style=flat-square&logo=amcharts&logoColor=white&labelColor=555555)

#### State & Data Management
![Firebase](https://img.shields.io/badge/Firebase-12.5.0-555555?style=flat-square&logo=firebase&logoColor=white&labelColor=FFCA28)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90.11-555555?style=flat-square&logo=reactquery&logoColor=white&labelColor=FF4154)
![Axios](https://img.shields.io/badge/Axios-1.13.1-555555?style=flat-square&logo=axios&logoColor=white&labelColor=5A29E4)

#### Styling & UI
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-555555?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=06B6D4)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.24-555555?style=flat-square&logo=framer&logoColor=white&labelColor=0055FF)

<br/>

## ✨ 주요 기능
영화, 영화인(배우, 감독, 스태프 등) 데이터를 3가지 유형의 인터랙티브 그래프로 표현해 보았습니다. 3가지의 그래프 모두 노드 검색을 통해 원하는 데이터를 찾아볼 수 있습니다.

#### 🎬 영화-인물 이분 그래프 (BipartiteGraph)
> **"영화와 참여진의 관계는?"**

- 서로 다른 유형의 노드(영화 vs 사람)를 시각적으로 구분하여 작품을 중심으로 한 관계를 탐색합니다.

#### 👤 에고 네트워크 (EgoGraph)
> **"특정 인물의 1촌 인맥 지도는?"**
- 중심 인물(Ego)을 기준으로 직접 연결된 1차 관계망만 필터링하여 보여줍니다.
- 협업 횟수(Weight)에 따라 노드 크기와 링크 두께를 정규화하여 시각적 위계를 표현했습니다.

#### 🤝 협업 네트워크 (CollabNetworkGraph)
> **"누가 누구와 사단(Crew)인가?"**
- **Louvain(루뱅) 알고리즘**으로 분석된 커뮤니티 데이터를 기반으로, 동일한 색상 그룹(사단)을 시각화합니다.
- 특정 노드 클릭 시, 연결되지 않은 다른 노드들의 `opacity`를 낮추어, **선택된 인물과 그 관련 노드만 강조**합니다.

<br/>

## 🖥️ 프로젝트 시연

<table width="100%">
<tr>
  <td width="50%" align="center">
  <b>홈페이지 메인</b><br>
    
  ![HomePage](https://github.com/user-attachments/assets/163a55a5-cb53-4636-9625-d932be9488e1)

  </td>

  <td width="50%" align="center">
  <b>그래프 메인</b><br>
    
![GraphMain](https://github.com/user-attachments/assets/7f67a5b6-fe1e-43cf-bff3-e5035dd0e582)

  </td>
</tr>



<tr>
  <td width="50%" align="center">
  <b>캐릭터 아키타입</b><br>

  ![Archetype](https://github.com/user-attachments/assets/203c5891-6343-4bd2-bce1-267ef3104219)

  </td>
  <td width="50%" align="center">
  <b>1. 영화-영화인 네트워크</b><br>

  ![Graph1](https://github.com/user-attachments/assets/408042d0-4bca-469a-8589-9e60a6159951)

  </td>
</tr>

<tr>
  <td width="50%" align="center">
  <b>2. 에고 네트워크</b><br>

  ![Graph2](https://github.com/user-attachments/assets/2a3a0c0d-4099-48d1-8dd6-bbe9b2809fe3)

  </td>

  <td width="50%" align="center">
  <b>3. 협업 네트워크</b><br>

  ![Graph3](https://github.com/user-attachments/assets/c5022908-b4bc-496a-9d4a-831f6d1253ba)

  </td>
</tr>

<tr>
  <td width="50%" align="center">
  <b>일간 트렌드 </b><br>

  ![Daily](https://github.com/user-attachments/assets/c96920a6-9a75-406a-beff-1a0ac3012184)

  </td>

  <td width="50%" align="center">
  <b>주간트렌드 </b><br>

  ![Weekly](https://github.com/user-attachments/assets/ae3dc458-e2fe-4eef-ae4c-4b0e04e0417f)

  </td>
</tr>

<tr>
  <td width="50%" align="center">
  <b>세계 트렌드 </b><br>

  ![World](https://github.com/user-attachments/assets/ff9f0e25-a04a-4b1f-8192-9322d73791fb)

  </td>

  <td width="50%" align="center">
  <b>영화 목록 </b><br>

  ![Movies](https://github.com/user-attachments/assets/d256c13f-a689-4413-818f-4c3eb441a6c2)

  </td>
</tr>

</table>

<br/>

## 📂 프로젝트 구조
이번 프로젝트에서 주요 기능을 담당하는 페이지 위주로만 작성하였습니다.
```
src
├── components       # UI 컴포넌트 (기능별 모듈화)
│   ├── GraphPage    # 그래프 시각화 핵심 모듈 
│   ├── DetailPage   # 영화 상세 정보 및 미디어 탭
│   └── common       # 재사용 가능한 공통 UI 키트
│
├── hooks            # 커스텀훅 관련 (비즈니스 로직 분리)
│   ├── useGraphSearch.ts   # 그래프 검색 및 좌표 계산 알고리즘
│   ├── useAuth.tsx         # Firebase 인증 상태 관리
│   └── useAllMovies.ts     # 데이터 Fetching 및 캐싱 전략
│
├── services         # API 통신 레이어
│   ├── movies       # TMDB & KOBIS 데이터 정규화(Normalization)
│   └── archetype    # 데이터 분석 로직
│
├── pages            # 라우팅 페이지
├── types            # TypeScript 타입 정의
└── utils            # 순수 함수 유틸리티
 (이하 생략)
```
