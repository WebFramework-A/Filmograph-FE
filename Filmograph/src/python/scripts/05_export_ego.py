import networkx as nx
import pickle
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Firestore 초기화
cred = credentials.Certificate("../../../filmograph-admin-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Ego JSON 생성 함수
def ego_to_json(G, ego):
    ego_graph = nx.ego_graph(G, ego, radius=1)

    nodes = []
    for node, attrs in ego_graph.nodes(data=True):
        nodes.append({
            "id": attrs.get("id", node),
            "label": node,
            "community": attrs.get("community", 0),
            "degree": ego_graph.degree(node),
            "movies_count": attrs.get("movies_count", 0),
            "role": attrs.get("role", "기타")
        })

    links = []
    for u, v, attrs in ego_graph.edges(data=True):
        links.append({
            "source": G.nodes[u].get("id", u),
            "target": G.nodes[v].get("id", v),
            "weight": attrs.get("weight", 1),
            "movies": attrs.get("movies", [])
        })

    return {
        "ego": G.nodes[ego].get("id", ego),
        "label": ego,
        "nodes": nodes,
        "links": links,
        "meta": {
            "nodeCount": len(nodes),
            "linkCount": len(links),
            "generatedAt": datetime.now().isoformat()
        }
    }

# Firestore 업로드 함수
def upload_ego_graph(ego_json):
    doc_id = ego_json["ego"]
    db.collection("egoGraphs").document(doc_id).set(ego_json)
    print(f" 업로드 완료 → egoGraphs/{doc_id}")

def main():
    # 전체 네트워크 로드
    with open("../output/network_with_community.gpickle", "rb") as f:
        G = pickle.load(f)

    print("전체 네트워크 로드 완료")
    print("노드 수:", G.number_of_nodes())
    print("엣지 수:", G.number_of_edges(), "\n")

    for person_name in G.nodes():
        ego_json = ego_to_json(G, person_name)   # JSON 생성
        upload_ego_graph(ego_json)               # Firestore 업로드

    print("\n모든 Ego Graph Firestore 업로드 완료!")

if __name__ == "__main__":
    main()