import numpy as np
import json
import os

FAISS_INDEX_PATH = "faiss_index.bin"
FAISS_MAP_PATH = "faiss_map.json"
EMBEDDING_DIM = 384

class VectorStore:
    def __init__(self):
        self.index = None
        self.id_map = []

    def _get_index(self):
        if self.index is None:
            import faiss
            if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(FAISS_MAP_PATH):
                self.index = faiss.read_index(FAISS_INDEX_PATH)
                with open(FAISS_MAP_PATH, "r") as f:
                    self.id_map = json.load(f)
            else:
                self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
                self.id_map = []
        return self.index

    def _save(self):
        import faiss
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(FAISS_MAP_PATH, "w") as f:
            json.dump(self.id_map, f)

    def add_candidate(self, candidate_id: int, embedding: np.ndarray):
        index = self._get_index()
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        vec = np.array([embedding], dtype=np.float32)
        index.add(vec)
        self.id_map.append(candidate_id)
        self._save()

    def search(self, query_embedding: np.ndarray, top_k: int = 10) -> list:
        index = self._get_index()
        if index.ntotal == 0:
            return []
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm
        query_vec = np.array([query_embedding], dtype=np.float32)
        top_k = min(top_k, index.ntotal)
        scores, indices = index.search(query_vec, top_k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append({
                    "candidate_id": self.id_map[idx],
                    "similarity_score": float(score)
                })
        return results

vector_store = VectorStore()