from typing_extensions import TypedDict
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore_v1.document import DocumentReference
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

# Import our types from the API module to ensure consistency
from app.api.resumes import ResumeData

# Initialize Firestore client with Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app()

db = firestore.client()

# Type definitions for Firestore documents
class ParsedResumeDocument(TypedDict, total=True):
    user_id: str
    data: ResumeData
    created_at: object  # SERVER_TIMESTAMP or datetime

class RawResumeDocument(TypedDict, total=True):
    user_id: str
    text: str
    created_at: object  # SERVER_TIMESTAMP or datetime

def _get_document_ref(collection_name: str) -> DocumentReference:
    """Get a new document reference with auto-generated ID."""
    return db.collection(collection_name).document()

def _save_document(doc_ref: DocumentReference, data: ParsedResumeDocument | RawResumeDocument) -> str:
    """Save a document and return its ID."""
    # Save document and ignore WriteResult
    _ = doc_ref.set(dict(data))
    
    # Extract document ID, which should never be None for auto-generated IDs
    doc_id: object = doc_ref.id
    if not isinstance(doc_id, str):
        raise ValueError("Document ID must be a string")
    return doc_id

async def save_parsed_resume(user_id: str, resume_data: ResumeData) -> str:
    """Save parsed resume data to Firestore.
    
    Args:
        user_id: The ID of the user who owns this resume
        resume_data: The parsed resume data to save
        
    Returns:
        The ID of the created document
    """
    doc_ref = _get_document_ref('parsed_resumes')
    
    # Create document data with server timestamp
    doc_data: ParsedResumeDocument = {
        'user_id': user_id,
        'data': resume_data,
        'created_at': SERVER_TIMESTAMP,
    }
    
    return _save_document(doc_ref, doc_data)

async def save_raw_resume(user_id: str, raw_text: str) -> str:
    """Save raw resume text to Firestore.
    
    Args:
        user_id: The ID of the user who owns this resume
        raw_text: The raw text content of the resume
        
    Returns:
        The ID of the created document
    """
    doc_ref = _get_document_ref('raw_resumes')
    
    # Create document data with server timestamp
    doc_data: RawResumeDocument = {
        'user_id': user_id,
        'text': raw_text,
        'created_at': SERVER_TIMESTAMP,
    }
    
    return _save_document(doc_ref, doc_data)
