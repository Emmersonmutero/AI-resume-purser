from collections.abc import Iterator
from typing import Protocol, Any

import firebase_admin  # type: ignore
from firebase_admin import firestore  # type: ignore
from google.cloud.firestore_v1.collection import CollectionReference

# Define type alias for records stored in Firestore
FirestoreData = dict[str, Any]

class FirestoreClient(Protocol):
    def collection(self, name: str) -> CollectionReference: ...


def _client() -> firestore.Client:  # FIX: Use proper client type, not .client
    """Get or initialize the Firestore client."""
    try:
        firebase_admin.get_app()
    except ValueError:
        _ = firebase_admin.initialize_app()
    return firestore.client()  # This is correct, returns firestore.Client


def get_firestore_client() -> firestore.Client:
    """Get a typed instance of the Firestore client."""
    return _client()


def save_parsed_resume(resume_id: str, data: FirestoreData) -> None:
    db = _client()
    db.collection("resumes").document(resume_id).set(data, merge=True)


def save_match(resume_id: str, score: int, reasons: list[str]) -> None:
    db = _client()
    db.collection("resumes").document(resume_id).set({
        "matchScore": score,
        "matchReasons": reasons
    }, merge=True)


def upsert_analytics(doc_id: str, payload: FirestoreData):
    db = _client()
    db.collection("analytics").document(doc_id).set(payload, merge=True)


def save_embedding(resume_id: str, vector: list[float], source: str = "miniLM"):
    db = _client()
    db.collection("resumes").document(resume_id).set({
        "embedding": vector,
        "embeddingModel": source
    }, merge=True)


def iter_resumes(limit: int = 500) -> Iterator[FirestoreData]:
    db = _client()
    q = db.collection("resumes").limit(limit).stream()
    for doc in q:
        d = doc.to_dict()
        if d:
            d["id"] = doc.id
            yield d
