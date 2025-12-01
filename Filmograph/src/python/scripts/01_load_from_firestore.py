import os
from dotenv import load_dotenv
import pyrebase
import pandas as pd
from datetime import datetime

print("=== .env 파일 로드 ===\n")

# .env 파일 로드 (프로젝트 루트에서)
load_dotenv()

# Firebase 설정
firebase_config = {
    "apiKey": os.getenv("VITE_FIREBASE_API_KEY"),
    "authDomain": os.getenv("VITE_FIREBASE_AUTH_DOMAIN"),
    "projectId": os.getenv("VITE_FIREBASE_PROJECT_ID"),
    "storageBucket": os.getenv("VITE_FIREBASE_STORAGE_BUCKET"),
    "messagingSenderId": os.getenv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    "appId": os.getenv("VITE_FIREBASE_APP_ID"),
    "databaseURL": ""
}

# 설정 확인
print("Firebase 설정:")
print(f"  Project ID: {firebase_config['projectId']}")
print(f"  Auth Domain: {firebase_config['authDomain']}")
print()

# Firebase 초기화
firebase = pyrebase.initialize_app(firebase_config)
db = firebase.database()

print("✅ Firebase 연결 성공!\n")

# ===========================
# Firestore 접근을 위해서는 REST API를 사용
# ===========================

print("=== Firestore REST API로 데이터 가져오기 ===\n")

import requests

# Firestore REST API 엔드포인트
project_id = firebase_config['projectId']
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"

def get_firestore_collection(collection_name):
    """
    Firestore 컬렉션의 모든 문서를 가져오는 함수
    """
    url = f"{base_url}/{collection_name}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ 오류: {response.status_code}")
        print(response.text)
        return None

def parse_firestore_document(doc):
    """
    Firestore 문서를 Python dict로 변환
    """
    if 'fields' not in doc:
        return {}
    
    result = {}
    fields = doc['fields']
    
    for key, value in fields.items():
        # Firestore의 타입별 처리
        if 'stringValue' in value:
            result[key] = value['stringValue']
        elif 'integerValue' in value:
            result[key] = int(value['integerValue'])
        elif 'arrayValue' in value:
            # 배열 처리
            array_values = value['arrayValue'].get('values', [])
            result[key] = []
            for item in array_values:
                if 'stringValue' in item:
                    result[key].append(item['stringValue'])
                elif 'mapValue' in item:
                    # 배열 안의 객체 처리
                    map_fields = item['mapValue'].get('fields', {})
                    obj = {}
                    for map_key, map_value in map_fields.items():
                        if 'stringValue' in map_value:
                            obj[map_key] = map_value['stringValue']
                        elif 'integerValue' in map_value:
                            obj[map_key] = int(map_value['integerValue'])
                    result[key].append(obj)
        elif 'timestampValue' in value:
            result[key] = value['timestampValue']
    
    return result

# persons 컬렉션 가져오기
print("영화인 데이터 로딩 중...")
response = get_firestore_collection('persons')

if not response or 'documents' not in response:
    print("❌ 데이터를 가져올 수 없습니다.")
    print("   Firebase 보안 규칙을 확인하세요:")
    print("   → Firestore > 규칙 > allow read: if true;")
    exit(1)

# 문서 파싱
persons_data = []
for doc in response['documents']:
    person = parse_firestore_document(doc)
    if person:
        persons_data.append(person)

print(f"✅ 총 {len(persons_data)}명의 영화인 로드 완료!\n")

# 데이터 미리보기
if len(persons_data) > 0:
    print("=== 첫 번째 영화인 데이터 예시 ===")
    first_person = persons_data[0]
    print(f"이름: {first_person.get('name', 'Unknown')}")
    print(f"역할: {first_person.get('repRoleNm', 'Unknown')}")
    print(f"참여 영화 수: {len(first_person.get('characters', []))}편")
    print()

# ===========================
# 영화인-영화 관계 데이터 생성
# ===========================

print("=== 영화인-영화 관계 데이터 생성 중... ===\n")

person_movie_list = []

for person in persons_data:
    person_id = person.get('id', 'Unknown')
    person_name = person.get('name', 'Unknown')
    person_role = person.get('repRoleNm', '기타')
    
    # characters 배열에서 영화 정보 추출
    characters = person.get('characters', [])
    
    if not characters or len(characters) == 0:
        # characters가 없으면 filmo 사용
        filmo = person.get('filmo', [])
        for movie_title in filmo:
            if movie_title:
                person_movie_list.append({
                    'person_id': person_id,
                    'person_name': person_name,
                    'person_role': person_role,
                    'movie_id': None,
                    'movie_title': movie_title,
                    'character_name': None
                })
    else:
        # characters 배열 처리
        for char in characters:
            movie_id = char.get('movieId', None)
            movie_title = char.get('movieTitle', 'Unknown')
            character_name = char.get('characterName', None)
            
            if movie_title and movie_title != 'Unknown':
                person_movie_list.append({
                    'person_id': person_id,
                    'person_name': person_name,
                    'person_role': person_role,
                    'movie_id': movie_id,
                    'movie_title': movie_title,
                    'character_name': character_name
                })

# DataFrame 생성
df = pd.DataFrame(person_movie_list)

print(f"✅ 총 {len(df)}개의 영화인-영화 관계 생성\n")

if len(df) > 0:
    print("=== 데이터 미리보기 ===")
    print(df.head(10))
    print()

# ===========================
# 데이터 정제
# ===========================

print("=== 데이터 정제 중... ===\n")

original_len = len(df)

# 1. 결측치 제거
df = df.dropna(subset=['person_name', 'movie_title'])
print(f"1. 결측치 제거: {original_len - len(df)}개 행 제거")

# 2. 중복 제거
original_len = len(df)
df = df.drop_duplicates(subset=['person_name', 'movie_title'])
print(f"2. 중복 제거: {original_len - len(df)}개 행 제거")

# 3. 이름/제목 공백 정리
df['person_name'] = df['person_name'].str.strip()
df['movie_title'] = df['movie_title'].str.strip()
print(f"3. 공백 정리 완료")

# 4. 빈 문자열 제거
original_len = len(df)
df = df[df['person_name'] != '']
df = df[df['movie_title'] != '']
print(f"4. 빈 문자열 제거: {original_len - len(df)}개 행 제거")

# 5. 'Unknown' 제거
original_len = len(df)
df = df[df['movie_title'] != 'Unknown']
print(f"5. Unknown 제거: {original_len - len(df)}개 행 제거")

print(f"\n✅ 최종 데이터: {len(df)}개 행")

# ===========================
# 통계 정보
# ===========================

print("\n=== 📊 데이터 통계 ===")
print(f"총 영화 수: {df['movie_title'].nunique()}개")
print(f"총 영화인 수: {df['person_name'].nunique()}명")

# 역할별 통계
if 'person_role' in df.columns:
    print(f"\n=== 역할별 분포 ===")
    role_counts = df['person_role'].value_counts()
    for role, count in role_counts.items():
        unique_persons = df[df['person_role'] == role]['person_name'].nunique()
        print(f"  - {role}: {unique_persons}명")

# 가장 많이 참여한 영화인 Top 10
print("\n=== 🎬 가장 활발한 영화인 Top 10 ===")
top_people = df['person_name'].value_counts().head(10)
for i, (name, count) in enumerate(top_people.items(), 1):
    role = df[df['person_name'] == name]['person_role'].iloc[0]
    print(f"{i:2d}. {name} ({role}): {count}편")

# 가장 많은 영화인이 참여한 영화 Top 10
print("\n=== 🎥 참여 인원이 많은 영화 Top 10 ===")
top_movies = df['movie_title'].value_counts().head(10)
for i, (title, count) in enumerate(top_movies.items(), 1):
    print(f"{i:2d}. {title}: {count}명")

# 협업 가능성 확인
print("\n=== 🔗 협업 네트워크 가능성 분석 ===")
movies_with_multiple_people = df.groupby('movie_title')['person_name'].count()
movies_with_collab = movies_with_multiple_people[movies_with_multiple_people >= 2]
print(f"협업 관계가 있는 영화: {len(movies_with_collab)}개")
print(f"평균 참여 인원: {movies_with_multiple_people.mean():.1f}명")

if len(movies_with_collab) < 10:
    print("\n⚠️  경고: 협업 관계가 있는 영화가 너무 적습니다!")
    print("   → characters 배열이 제대로 채워져 있는지 확인하세요.")

# ===========================
# 저장
# ===========================

# 폴더 생성
os.makedirs('../data', exist_ok=True)

# CSV로 저장
df.to_csv('../data/movies_from_firestore.csv', index=False, encoding='utf-8-sig')
print(f"\n✅ CSV 저장 완료: data/movies_from_firestore.csv")

# Pickle로 저장
df.to_pickle('../data/movies_data.pkl')
print(f"✅ Pickle 저장 완료: data/movies_data.pkl")

# 원본 persons 데이터도 저장
persons_df = pd.DataFrame(persons_data)
persons_df.to_pickle('../data/persons_raw.pkl')
print(f"✅ 원본 영화인 데이터 저장: data/persons_raw.pkl")

print("\n" + "="*50)
print("🎉 Step 1 완료!")
print("="*50)
print("\n👉 다음 단계: python 02_build_network.py")