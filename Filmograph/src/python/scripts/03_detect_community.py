import networkx as nx
import community as community_louvain
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from collections import Counter
import os
import pickle

print("="*60)
print("🎨 Step 3: 커뮤니티 탐지")
print("="*60)
print()

# ===========================
# 네트워크 로드
# ===========================

print("=== 네트워크 로딩 중... ===\n")

# ✅ 새로운 코드
with open('../output/network.gpickle', 'rb') as f:
    G = pickle.load(f)

print(f"✅ 로드 완료")
print(f"   - 노드: {G.number_of_nodes()}개")
print(f"   - 엣지: {G.number_of_edges()}개")
print()

# ===========================
# Louvain 알고리즘으로 커뮤니티 탐지
# ===========================

print("=== 커뮤니티 탐지 시작 ===\n")
print("Louvain 알고리즘 실행 중...")

resolution = 1.0

partition = community_louvain.best_partition(
    G, 
    weight='weight',
    resolution=resolution
)

print(f"✅ 커뮤니티 탐지 완료 (resolution={resolution})\n")

# ===========================
# 커뮤니티 정보를 노드에 추가
# ===========================

print("노드에 커뮤니티 정보 추가 중...")

for node, comm_id in partition.items():
    G.nodes[node]['community'] = comm_id

print("✅ 완료\n")

# ===========================
# 커뮤니티 통계
# ===========================

num_communities = len(set(partition.values()))

print("="*60)
print("📊 커뮤니티 통계")
print("="*60)
print(f"탐지된 커뮤니티 수: {num_communities}개")
print()

comm_counts = Counter(partition.values())

print("=== 커뮤니티별 인원 ===")
for comm_id in sorted(comm_counts.keys()):
    count = comm_counts[comm_id]
    percentage = (count / G.number_of_nodes()) * 100
    print(f"커뮤니티 {comm_id:2d}: {count:4d}명 ({percentage:5.1f}%)")

print()

modularity = community_louvain.modularity(partition, G, weight='weight')

print(f"📈 모듈성(Modularity): {modularity:.4f}")
print()

if modularity < 0.3:
    print("⚠️  모듈성이 낮습니다. 커뮤니티 구분이 약합니다.")
elif modularity < 0.7:
    print("✅ 좋은 커뮤니티 구조입니다!")
else:
    print("🌟 매우 명확한 커뮤니티 구조입니다!")

print()

# ===========================
# 각 커뮤니티의 대표 인물 찾기
# ===========================

print("=== 🌟 커뮤니티별 주요 인물 ===\n")

communities = {}
for node, comm_id in partition.items():
    if comm_id not in communities:
        communities[comm_id] = []
    communities[comm_id].append(node)

top_communities = sorted(comm_counts.items(), key=lambda x: x[1], reverse=True)[:5]

for comm_id, size in top_communities:
    print(f"커뮤니티 {comm_id} ({size}명):")
    
    members = communities[comm_id]
    members_with_degree = [(m, G.degree(m)) for m in members]
    top_members = sorted(members_with_degree, key=lambda x: x[1], reverse=True)[:3]
    
    for i, (member, degree) in enumerate(top_members, 1):
        role = G.nodes[member].get('role', '기타')
        movies_count = G.nodes[member].get('movies_count', 0)
        print(f"  {i}. {member} ({role}) - {degree}명과 연결, {movies_count}편 참여")
    
    print()

# ===========================
# 시각화
# ===========================

print("=== 시각화 생성 중... ===\n")

print("레이아웃 계산 중... (시간이 걸릴 수 있습니다)")
pos = nx.spring_layout(G, k=0.5, iterations=50, seed=42)

plt.figure(figsize=(24, 24))

colors = [partition[node] for node in G.nodes()]
node_sizes = [G.degree(node) * 10 for node in G.nodes()]

nx.draw_networkx_nodes(
    G, pos,
    node_color=colors,
    node_size=node_sizes,
    cmap=plt.cm.tab20,
    alpha=0.8
)

nx.draw_networkx_edges(
    G, pos,
    alpha=0.1,
    width=0.5
)

degree_dict = dict(G.degree())
top_nodes = sorted(degree_dict.items(), key=lambda x: x[1], reverse=True)[:30]
labels = {node: node for node, _ in top_nodes}

nx.draw_networkx_labels(
    G, pos,
    labels,
    font_size=8,
    font_family='AppleGothic'
)

plt.title(
    f"영화인 협업 네트워크 - {num_communities}개 커뮤니티\n"
    f"(Modularity: {modularity:.3f})",
    fontsize=20,
    pad=20
)
plt.axis('off')
plt.tight_layout()

os.makedirs('../output', exist_ok=True)
plt.savefig('../output/community_visualization.png', dpi=150, bbox_inches='tight')
print("✅ 시각화 저장: output/community_visualization.png")

plt.close()

# ===========================
# 네트워크 저장
# ===========================

with open('../output/network_with_community.gpickle', 'wb') as f:
    pickle.dump(G, f)

print("✅ 네트워크 저장: output/network_with_community.gpickle")

print()
print("="*60)
print("🎉 Step 3 완료!")
print("="*60)
print("\n👉 다음 단계: python 04_export_json.py")