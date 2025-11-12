import networkx as nx
import json
from datetime import datetime
import os
import pickle  # ⬅️ 이 줄 추가!

print("="*60)
print("📦 Step 4: JSON 생성")
print("="*60)
print()

# ===========================
# 네트워크 로드 (커뮤니티 정보 포함)
# ===========================

print("=== 네트워크 로딩 중... ===\n")

with open('../output/network_with_community.gpickle', 'rb') as f:
    G = pickle.load(f)

print(f"✅ 로드 완료")
print(f"   - 노드: {G.number_of_nodes()}개")
print(f"   - 엣지: {G.number_of_edges()}개")
print()

# ===========================
# 노드 데이터 생성
# ===========================

print("=== 노드 데이터 생성 중... ===\n")

nodes_data = []

for node in G.nodes(data=True):
    node_id = node[0]  # 영화인 이름
    node_attrs = node[1]  # 속성들
    
    nodes_data.append({
        "id": node_id,
        "label": node_id,
        "community": node_attrs.get('community', 0),
        "degree": node_attrs.get('degree', G.degree(node_id)),
        "movies_count": node_attrs.get('movies_count', 0),
        "role": node_attrs.get('role', '기타')
    })

print(f"✅ {len(nodes_data)}개 노드 생성 완료")

# ===========================
# 링크(엣지) 데이터 생성
# ===========================

print("=== 링크 데이터 생성 중... ===\n")

links_data = []

for edge in G.edges(data=True):
    source, target, attrs = edge
    
    # 함께 작업한 영화 목록 (최대 5개만)
    movies = attrs.get('movies', [])
    movies_sample = movies[:5] if len(movies) > 5 else movies
    
    links_data.append({
        "source": source,
        "target": target,
        "weight": attrs.get('weight', 1),
        "movies": movies_sample,
        "total_movies": len(movies)
    })

print(f"✅ {len(links_data)}개 링크 생성 완료")

# ===========================
# 메타데이터 생성
# ===========================

print("\n=== 메타데이터 생성 중... ===\n")

# 커뮤니티 수 계산
communities = set(nx.get_node_attributes(G, 'community').values())
num_communities = len(communities)

# 통계 계산
total_collaborations = sum([d['weight'] for _, _, d in G.edges(data=True)])
avg_collaboration = total_collaborations / G.number_of_edges() if G.number_of_edges() > 0 else 0

metadata = {
    "total_nodes": G.number_of_nodes(),
    "total_links": G.number_of_edges(),
    "communities": num_communities,
    "total_collaborations": total_collaborations,
    "avg_collaboration_per_link": round(avg_collaboration, 2),
    "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "version": "1.0"
}

print("✅ 메타데이터 생성 완료")

# ===========================
# 최종 JSON 객체 생성
# ===========================

print("\n=== 최종 JSON 생성 중... ===\n")

final_data = {
    "metadata": metadata,
    "nodes": nodes_data,
    "links": links_data
}

# ===========================
# JSON 파일로 저장
# ===========================

os.makedirs('../output', exist_ok=True)
output_path = '../output/network_data.json'

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

# 파일 크기 계산
file_size_bytes = os.path.getsize(output_path)
file_size_kb = file_size_bytes / 1024
file_size_mb = file_size_kb / 1024

print("="*60)
print("📊 생성된 JSON 정보")
print("="*60)
print(f"파일 위치: {output_path}")
print(f"파일 크기: {file_size_kb:.2f} KB ({file_size_mb:.2f} MB)")
print()
print(f"노드: {len(nodes_data)}개")
print(f"링크: {len(links_data)}개")
print(f"커뮤니티: {num_communities}개")
print(f"총 협업 횟수: {total_collaborations}회")
print(f"평균 협업 횟수: {avg_collaboration:.2f}회")
print()

# JSON 구조 미리보기
print("=== JSON 구조 미리보기 ===\n")
print("metadata:")
print(f"  {json.dumps(metadata, ensure_ascii=False, indent=2)}")
print()
print("nodes[0]:")
print(f"  {json.dumps(nodes_data[0], ensure_ascii=False, indent=2)}")
print()
print("links[0]:")
print(f"  {json.dumps(links_data[0], ensure_ascii=False, indent=2)}")
print()

# ===========================
# 파일 크기 경고
# ===========================

if file_size_mb > 5:
    print("⚠️  경고: JSON 파일이 5MB를 초과합니다!")
    print(f"   현재 크기: {file_size_mb:.2f} MB")
    print("   → 프론트엔드 로딩이 느릴 수 있습니다.")
    print("   → 05_filter_network.py로 데이터를 줄이는 것을 권장합니다.")
    print()
elif file_size_mb > 2:
    print("💡 파일 크기가 2MB를 초과합니다.")
    print(f"   현재 크기: {file_size_mb:.2f} MB")
    print("   → 필요시 05_filter_network.py로 최적화할 수 있습니다.")
    print()
else:
    print("✅ 파일 크기가 적당합니다!")
    print()

print("="*60)
print("🎉 Step 4 완료!")
print("="*60)
print()
print("👉 이 파일을 프론트엔드 팀원에게 전달하세요!")
print(f"   파일 위치: {output_path}")