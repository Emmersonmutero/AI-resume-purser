# app/api/resumes.py
import os
import json
from typing import Any, TypeGuard, TypedDict
from fastapi import APIRouter
from groq import Groq

# These imports should be fixed by creating the appropriate modules
# from services.firestore import save_parsed_resume, save_raw_resume
# from dependencies.auth import require_firebase_user

router = APIRouter()

class ExperienceEntry(TypedDict, total=False):
    title: str
    company: str
    startDate: str  # YYYY-MM format
    endDate: str    # YYYY-MM format
    bullets: list[str]
    location: str

class EducationEntry(TypedDict, total=False):
    degree: str
    institution: str
    startDate: str  # YYYY-MM format
    endDate: str    # YYYY-MM format
    field: str

class Contact(TypedDict, total=False):
    fullName: str
    email: str
    phone: str
    location: str

class ResumeData(TypedDict):
    contact: Contact
    summary: str
    skills: list[str]
    experience: list[ExperienceEntry]
    education: list[EducationEntry]
    certifications: list[str]
    languages: list[str]

def is_contact(data: dict[str, Any]) -> TypeGuard[Contact]:
    """Validate that a dictionary matches Contact structure"""
    if not isinstance(data, dict):
        return False
    # Use data.get to safely access keys and check type
    if not all(isinstance(data.get(k), (str, type(None))) for k in ["fullName", "email", "phone", "location"]):
        return False
    return True

def is_experience_entry(data: dict[str, Any]) -> TypeGuard[ExperienceEntry]:
    """Validate that a dictionary matches ExperienceEntry structure"""
    if not isinstance(data, dict):
        return False
    
    # Required keys must be strings
    if data.get("title") is not None and not isinstance(data["title"], str):
        return False
    if data.get("company") is not None and not isinstance(data["company"], str):
        return False

    # Optional string keys
    if not all(isinstance(data.get(k), (str, type(None))) for k in ["startDate", "endDate", "location"]):
        return False
        
    # Check for the optional bullets list
    bullets = data.get("bullets")
    if bullets is not None:
        if not isinstance(bullets, list) or not all(isinstance(b, str) for b in bullets):
            return False

    return True

def is_education_entry(data: dict[str, Any]) -> TypeGuard[EducationEntry]:
    """Validate that a dictionary matches EducationEntry structure"""
    if not isinstance(data, dict):
        return False

    # Required keys must be strings
    if data.get("degree") is not None and not isinstance(data["degree"], str):
        return False
    if data.get("institution") is not None and not isinstance(data["institution"], str):
        return False
    
    # Optional string keys
    if not all(isinstance(data.get(k), (str, type(None))) for k in ["startDate", "endDate", "field"]):
        return False
        
    return True

def is_resume_data(data: Any) -> TypeGuard[ResumeData]:
    """Validate that a dictionary matches ResumeData structure"""
    if not isinstance(data, dict):
        return False
        
    # All checks use .get with a default value to avoid KeyErrors
    return (
        is_contact(data.get("contact", {})) and
        isinstance(data.get("summary"), (str, type(None))) and
        isinstance(data.get("skills"), (list, type(None))) and all(isinstance(s, str) for s in data.get("skills", [])) and
        isinstance(data.get("experience"), (list, type(None))) and all(is_experience_entry(e) for e in data.get("experience", [])) and
        isinstance(data.get("education"), (list, type(None))) and all(is_education_entry(e) for e in data.get("education", [])) and
        isinstance(data.get("certifications"), (list, type(None))) and all(isinstance(c, str) for c in data.get("certifications", [])) and
        isinstance(data.get("languages"), (list, type(None))) and all(isinstance(l, str) for l in data.get("languages", []))
    )

# Initialize Groq client
_groq: Groq | None = None

def get_groq_client() -> Groq:
    global _groq
    if _groq is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        _groq = Groq(api_key=api_key)
    return _groq

async def parse_resume_with_groq(text: str) -> ResumeData:
    client = get_groq_client()
    prompt = f"""
    Parse the following resume text into structured JSON with:
    - contact: fullName, email, phone, location
    - summary: string
    - skills: list of strings
    - experience: list of {{ title, company, startDate, endDate, bullets }}
    - education: list of {{ degree, institution, startDate, endDate }}
    - certifications: list of strings
    - languages: list of strings

    Return only valid JSON without any extra text or explanation.
    """
    completion = client.chat.completions.create(
        messages=[{
            "role": "system",
            "content": prompt
        }, {
            "role": "user",
            "content": text
        }],
        model="mixtral-8x7b-32768"
    )
    
    # Get response content
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("Empty response from Groq")
        
    # Parse the JSON
    try:
        raw_data: Any = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to decode JSON from Groq response: {e}")

    # Validate and return the data
    if not is_resume_data(raw_data):
        raise ValueError("Invalid resume data structure returned from Groq")
        
    return raw_data