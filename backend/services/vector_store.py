import faiss
import numpy as np
import json
import os

FAISS_INDEX_PATH = "faiss_index.bin"
FAISS_MAP_PATH = "faiss_map.json"  # maps faiss index position → candidate_id

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 dimension

class VectorStore:
    def __init__(self):
        self.index = None
        self.id_map = []  # list of candidate_ids in order
        self._load_or_create()

    def _load_or_create(self):
        if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(FAISS_MAP_PATH):
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            with open(FAISS_MAP_PATH, "r") as f:
                self.id_map = json.load(f)
        else:
            self.index = faiss.IndexFlatIP(EMBEDDING_DIM)  # Inner Product = cosine if normalized
            self.id_map = []

    def _save(self):
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(FAISS_MAP_PATH, "w") as f:
            json.dump(self.id_map, f)

    def add_candidate(self, candidate_id: int, embedding: np.ndarray):
        """Add a candidate embedding to the index."""
        # Normalize for cosine similarity
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        
        vec = np.array([embedding], dtype=np.float32)
        self.index.add(vec)
        self.id_map.append(candidate_id)
        self._save()

    def search(self, query_embedding: np.ndarray, top_k: int = 10) -> list[dict]:
        """Search for similar candidates."""
        if self.index.ntotal == 0:
            return []

        # Normalize query
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm

        query_vec = np.array([query_embedding], dtype=np.float32)
        top_k = min(top_k, self.index.ntotal)
        
        scores, indices = self.index.search(query_vec, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append({
                    "candidate_id": self.id_map[idx],
                    "similarity_score": float(score)
                })
        return results

# Singleton instance
vector_store = VectorStore()
