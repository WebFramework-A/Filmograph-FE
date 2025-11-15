import networkx as nx
import pickle
import json
import os
from datetime import datetime

def ego_to_json(G, ego):

    ego_graph = nx.ego_graph(G, ego, radius=1)

    nodes = []
    for node, attrs in ego_graph.nodes(data=True):
        nodes.append({
            # "id": KOBIS peopleCd)
            "id": attrs.get("id", node),                    # "id": KOBIS peopleCd
            "label": node,                                  # "label": 인물 이름
            "community": attrs.get("community", 0),         # "community": 같은 그룹/집단 커뮤니티 ID
            "degree": ego_graph.degree(node),               # "degree": 연결된 사람 수
            "movies_count": attrs.get("movies_count", 0),   # "movies_count": 참여한 영화 수 
            "role": attrs.get("role", "기타")
        })

    links = []
    for u, v, attrs in ego_graph.edges(data=True):
        links.append({
            "source": G.nodes[u].get("id", u),
            "target": G.nodes[v].get("id", v),
            "weight": attrs.get("weight", 1),       # "weight": 협업 횟수
            "movies": attrs.get("movies", [])       # "movies": 함께한 영화 제목 리스트
        })

    return {
        # "ego": 중심 인물 ID

        "ego": G.nodes[ego].get("id", ego),     # "ego": 중심 인물 ID
        "label": ego,                           # "label": 중심 인물의 표시 이름
        "nodes": nodes,
        "links": links,
        "meta": {
            "nodeCount": len(nodes),            # 이 에고 네트워크에 포함된 사람 수
            "linkCount": len(links),            # 협업 관계 수
            "generatedAt": datetime.now().isoformat()  # JSON 생성 시각
        }
    }

# 1) 전체 협업 네트워크 로드
with open("../output/network_with_community.gpickle", "rb") as f:
    G = pickle.load(f)

print("전체 네트워크 로드 완료")
print("   - 노드 수:", G.number_of_nodes())
print("   - 엣지 수:", G.number_of_edges())

# 2) 에고 네트워크 JSON을 저장할 폴더 생성
output_dir = "../output/ego_networks"
os.makedirs(output_dir, exist_ok=True)

# 3) 전체 그래프에 포함된 '모든 사람'에 대해 반복
for person_name in G.nodes():
    person_id = G.nodes[person_name].get("id", person_name)

    # 해당 인물 중심의 에고 네트워크를 JSON 형태로 생성
    ego_json = ego_to_json(G, person_name)
    path = os.path.join(output_dir, f"{person_id}.json")

    # JSON 파일로 저장
    with open(path, "w", encoding="utf-8") as f:
        json.dump(ego_json, f, ensure_ascii=False, indent=2)

    print("Ego JSON 생성 완료:", path)

print("\n모든 Ego Network 생성 완료!")
print(f"저장 경로: {output_dir}/")