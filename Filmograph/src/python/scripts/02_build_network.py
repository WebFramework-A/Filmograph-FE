import pandas as pd
import networkx as nx
from itertools import combinations
from collections import defaultdict
import os
import pickle

print("="*60)
print("🔗 Step 2: 협업 네트워크 생성")
print("="*60)
print()

# ===========================
# 데이터 로드
# ===========================

print("=== 데이터 로딩 중... ===\n")

# Step 1에서 생성한 Pickle 파일 로드
df = pd.read_pickle('../data/movies_data.pkl')

print(f"✅ 로드 완료: {len(df)}개 행")
print(f"   - 영화 수: {df['movie_title'].nunique()}개")
print(f"   - 영화인 수: {df['person_name'].nunique()}명")
print()

# ===========================
# 네트워크 그래프 생성
# ===========================

print("=== 네트워크 구축 시작 ===\n")

# 빈 그래프 생성
G = nx.Graph()

# 영화별로 참여한 사람들 그룹화
# 예: {"기생충": ["송강호", "이선균", "조여정", "봉준호"], ...}
movies_dict = df.groupby('movie_title')['person_name'].apply(list).to_dict()

print(f"총 {len(movies_dict)}개의 영화")

# 협업 관계를 저장할 딕셔너리
collaboration_count = defaultdict(int)  # 협업 횟수
collaboration_movies = defaultdict(list)  # 함께 한 영화 리스트

# ===========================
# 각 영화마다 참여자들을 서로 연결
# ===========================

print("협업 관계 분석 중...")

for movie_title, people in movies_dict.items():
    # 한 영화에 2명 이상 참여했을 때만 협업 관계 성립
    if len(people) >= 2:
        # 모든 가능한 조합 생성
        # 예: [A, B, C] → (A,B), (A,C), (B,C)
        for person1, person2 in combinations(people, 2):
            # 알파벳 순으로 정렬 (A-B와 B-A를 같게 취급)
            edge = tuple(sorted([person1, person2]))
            
            # 협업 횟수 증가
            collaboration_count[edge] += 1
            
            # 함께 한 영화 기록
            collaboration_movies[edge].append(movie_title)

print(f"✅ 총 {len(collaboration_count)}개의 협업 관계 발견\n")

# ===========================
# 그래프에 엣지(협업 관계) 추가
# ===========================

print("그래프 구조 생성 중...")

for (person1, person2), count in collaboration_count.items():
    G.add_edge(
        person1, 
        person2,
        weight=count,  # 협업 횟수
        movies=collaboration_movies[(person1, person2)]  # 영화 목록 (리스트)
    )

print(f"✅ 엣지 추가 완료\n")

# ===========================
# 노드(영화인) 속성 추가
# ===========================

print("노드 속성 추가 중...")

for node in G.nodes():
    # 각 사람이 참여한 영화 목록
    person_movies = df[df['person_name'] == node]['movie_title'].tolist()
    
    # 역할 정보 (감독, 배우 등)
    person_role = df[df['person_name'] == node]['person_role'].iloc[0] if len(df[df['person_name'] == node]) > 0 else '기타'

    # KOBIS 사람 ID    
    person_id = df[df['person_name'] == node]['person_id'].iloc[0] if len(df[df['person_name'] == node]) > 0 else node
    
    # 속성 추가
    G.nodes[node]['movies_count'] = len(person_movies)  # 참여 영화 수
    G.nodes[node]['degree'] = G.degree(node)  # 연결된 사람 수
    G.nodes[node]['role'] = person_role  # 역할

    G.nodes[node]['id'] = person_id

print(f"✅ 노드 속성 추가 완료\n")

# ===========================
# 네트워크 통계
# ===========================

print("="*60)
print("📊 네트워크 통계")
print("="*60)
print(f"노드 (영화인): {G.number_of_nodes()}명")
print(f"엣지 (협업 관계): {G.number_of_edges()}개")
print(f"평균 협업 횟수: {sum([d['weight'] for _, _, d in G.edges(data=True)]) / G.number_of_edges():.2f}회")
print(f"평균 연결 수 (Degree): {sum(dict(G.degree()).values()) / G.number_of_nodes():.2f}명")
print()

# 가장 많이 협업한 사람 Top 5
print("=== 🌟 가장 연결이 많은 영화인 Top 5 ===")
degree_dict = dict(G.degree())
top_people = sorted(degree_dict.items(), key=lambda x: x[1], reverse=True)[:5]
for i, (person, degree) in enumerate(top_people, 1):
    role = G.nodes[person]['role']
    movies_count = G.nodes[person]['movies_count']
    print(f"{i}. {person} ({role}): {degree}명과 협업, 총 {movies_count}편 참여")

print()

# 가장 많이 함께 작업한 듀오 Top 5
print("=== 🤝 가장 많이 협업한 듀오 Top 5 ===")
edges_with_weight = [(u, v, d['weight']) for u, v, d in G.edges(data=True)]
top_edges = sorted(edges_with_weight, key=lambda x: x[2], reverse=True)[:5]
for i, (person1, person2, weight) in enumerate(top_edges, 1):
    movies = collaboration_movies[tuple(sorted([person1, person2]))]
    print(f"{i}. {person1} ↔ {person2}: {weight}편")
    print(f"   영화: {', '.join(movies[:3])}{'...' if len(movies) > 3 else ''}")

print()

# ===========================
# 네트워크 저장
# ===========================

print("=== 저장 중... ===")

# 폴더 생성
os.makedirs('../output', exist_ok=True)

# Pickle로 저장 (리스트 포함 가능)
with open('../output/network.gpickle', 'wb') as f:
    pickle.dump(G, f)
print("✅ 네트워크 파일 저장: output/network.gpickle")

# GraphML 저장 (리스트를 문자열로 변환 필요!)
print("GraphML 변환 중...")

# GraphML용 그래프 복사본 생성
G_graphml = G.copy()

# 엣지의 movies 속성을 문자열로 변환
for u, v, data in G_graphml.edges(data=True):
    if 'movies' in data and isinstance(data['movies'], list):
        # 리스트를 쉼표로 구분된 문자열로 변환
        data['movies'] = ', '.join(data['movies'])

# 이제 GraphML로 저장 가능
nx.write_graphml(G_graphml, '../output/network.graphml')
print("✅ GraphML 저장: output/network.graphml")

print()
print("="*60)
print("🎉 Step 2 완료!")
print("="*60)
print("\n👉 다음 단계: python3 03_detect_community.py")