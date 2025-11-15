import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Firestore 초기화
cred = credentials.Certificate("../../../filmograph-admin-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Ego JSON 위치
EGO_DIR = "../output/ego_networks"

# Firestore 업로드
def upload_ego_graph(ego_json):
    doc_id = ego_json["ego"]  # KOBIS 인물 ID 그대로 문서ID 사용

    db.collection("egoGraphs").document(doc_id).set(ego_json)
    print(f" 업로드 완료: egoGraphs/{doc_id}")

# 메인 실행
def main():
    files = [f for f in os.listdir(EGO_DIR) if f.endswith(".json")]
    print(f"감지된 Ego JSON 파일: {len(files)}개\n")

    for filename in files:
        path = os.path.join(EGO_DIR, filename)

        # JSON 로드
        with open(path, "r", encoding="utf-8") as f:
            ego_json = json.load(f)

        upload_ego_graph(ego_json)

    print("\n모든 Ego Network Firestore 업로드 완료!")

if __name__ == "__main__":
    main()