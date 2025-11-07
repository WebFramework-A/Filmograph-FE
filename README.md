
# 🎬 Filmograph

> 영화 데이터를 네트워크 그래프로 시각화한 웹사이트입니다.

Filmograph는 영화, 배우, 감독, 장르 간의 관계를 인터랙티브 그래프로 표현하여, 사용자가 직접 영화 세계를 탐험할 수 있는 웹 플랫폼입니다.

## ✨ 주요 기능

- **관계망 그래프**: 영화-배우, 영화-감독, 장르-배우 등 다양한 관계를 네트워크 그래프로 시각화
- **인터랙티브 검색**: 특정 영화나 배우를 검색하여 관련 노드를 하이라이트하고 시각적으로 탐색
- **캐릭터 아카이빙**: 영화 속 캐릭터 정보를 아카이빙하여 분류 및 시각화

<br/>

## 👥 팀 소개
| <img src="https://avatars.githubusercontent.com/u/160497134?v=4" alt="김민서님 프로필 사진" width="150"> | <img src="https://avatars.githubusercontent.com/u/190920292?v=4" alt="한국희님 프로필 사진" width="150"> | <img src="https://avatars.githubusercontent.com/u/232311799?v=4" alt="서유정님 프로필 사진" width="150"> | <img src="https://avatars.githubusercontent.com/u/146168416?v=4" alt="정민지님 프로필 사진" width="150"> |
|:---:|:---:|:---:|:---:|
| [김민서](https://github.com/minseeeeo) | [한국희](https://github.com/rnrzl) | [서유정](https://github.com/wsenuz) | [정민지](https://github.com/mint0326) |

<br/>

## 🛠️ 기술 스택
![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white)
![react-force-graph](https://img.shields.io/badge/-react--force--graph-brightgreen?style=flat)

<br/>

## 📝 커밋 컨벤션

프로젝트의 일관된 커밋 히스토리 관리를 위해 아래의 컨벤션을 따릅니다.

- **feat**: 새로운 기능 추가
  ```
  feat: 마이페이지 UI 구현
  ```

- **fix**: 버그 수정
  ```
  fix: 로그인 시 콘솔 오류 수정
  ```

- **style**: 코드 스타일 수정 (포맷팅, 세미콜론 추가 등)
  ```
  style: 헤더 컴포넌트 CSS 정리
  ```

- **refactor**: 코드 리팩토링 (기능 변경 없이 코드 구조 개선)
  ```
  refactor: getGraphData 함수 성능 개선
  ```

- **docs**: 문서 수정
  ```
  docs: README.md 업데이트
  ```
### 작성 규칙

- 제목은 50자 이내
- 제목 첫 글자는 대문자로 시작하지 않음
- 제목 끝에 마침표(.) 사용하지 않음
- 제목은 명령문으로 작성
- 본문은 선택사항이며, 필요시 제목과 본문 사이에 빈 줄 추가

<br/>

## 🚀 시작하기

### 필수 요구사항

- Node.js (v18 이상)
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>

# 프로젝트로 이동
cd Filmograph-FE/Filmograph/

# 의존성 설치
npm install

# 환경 변수 설정
# 루트 폴더의 `.env` 파일을 새로 만듦
# (추후 개발이 끝난 뒤, firebase를 읽기전용으로 변경하고 수정 예정)
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# VITE_FIREBASE_PROJECT_ID=your_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# VITE_FIREBASE_APP_ID=your_app_id

# 개발 서버 실행
npm run dev
```

<br/>

## 📁 프로젝트 구조

```
(추후 프로젝트가 끝난 이후 추가 예정)
```
