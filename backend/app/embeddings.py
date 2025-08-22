from collections.abc import Iterable
from sentence_transformers import SentenceTransformer  # type: ignore

_model = None

def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model

def embed_texts(texts: Iterable[str]) -> list[list[float]]:
    model = _get_model()
    embs = model.encode(list(texts), normalize_embeddings=True)  # type: ignore
    return [e.tolist() for e in embs]
