# Filmograph-FE
1.  `git pull`로 최신 코드를 받습니다.
2.  `npm install`로 의존성을 설치합니다.
3.  루트 폴더의 `.env` 파일을 새로 만듭니다.
4.  Firebase 콘솔에서 확인한 **웹 앱 키**를 `.env` 파일에 채워 넣습니다. (노션에 자세히 적어놓았습니다.)
5.  `npm run dev`로 개발 서버를 시작합니다.


## Firestore 데이터 구조

1.  **`movies`** (컬렉션)
    * `[docId: movieCd]` (예: "20124079")
    * `{ name: "기생충", type: "movie", val: 10, ... }`
2.  **`persons`** (컬렉션)
    * `[docId: personCd]` (예: "10056105")
    * `{ name: "봉준호", type: "person", val: 15, ... }`
3.  **`roles`** (컬렉션)
    * `[docId: autoId]` (자동 생성 ID)
    * `{ source: "10056105", target: "20124079" }`
    * *(그래프의 '선(Link)' 역할을 하는 핵심 컬렉션)*
