// batch-script/injectDummyData.js
const admin = require('firebase-admin');

// 1단계 5-②에서 받은 Admin 키 파일
const serviceAccount = require('./filmograph-admin-key.json'); 

// 1단계 5-①에서 확인한 projectId (VITE_FIREBASE_PROJECT_ID와 동일)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "filmograph-df1d4"
});

const db = admin.firestore();

// 우리가 논의한 알고리즘을 통해 생성된 '가짜' 데이터
const dummyNodes = [
  { id: "m1", name: "기생충", type: "movie", val: 10 },
  { id: "m2", name: "설국열차", type: "movie", val: 5 },
  { id: "p1", name: "봉준호", type: "person", val: 15 },
  { id: "p2", name: "송강호", type: "person", val: 12 },
];

const dummyLinks = [
  { source: "p1", target: "m1" },
  { source: "p2", target: "m1" },
  { source: "p1", target: "m2" },
  { source: "p2", target: "m2" },
];

async function injectData() {
  console.log('데이터 주입 시작...');

  // Node 데이터를 persons와 movies로 분리하여 저장
  for (const node of dummyNodes) {
    if (node.type === 'movie') {
      await db.collection('movies').doc(node.id).set(node);
    } else {
      await db.collection('persons').doc(node.id).set(node);
    }
  }
  console.log('Nodes 주입 완료.');

  // Link 데이터를 roles에 저장
  for (const link of dummyLinks) {
    await db.collection('roles').add(link);
  }
  console.log('Links 주입 완료.');
  console.log('모든 데이터 주입 성공!');
}

injectData();