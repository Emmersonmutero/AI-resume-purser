import os
import json
from typing_extensions import TypedDict
from typing import TypeVar, cast
from groq import Groq

# ----- TypedDict definitions -----
class ExperienceEntry(TypedDict, total=False):
    title: str
    company: str
    location: str
    startDate: str  # YYYY-MM format
    endDate: str    # YYYY-MM format
    bullets: list[str]

class EducationEntry(TypedDict, total=False):
    degree: str
    institution: str
    field: str
    startDate: str  # YYYY-MM format
    endDate: str    # YYYY-MM format

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

T = TypeVar("T", bound=ResumeData)

# ----- Groq client setup -----
_groq_client: Groq | None = None
MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

def get_groq_client() -> Groq:
    """Singleton Groq client."""
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        _groq_client = Groq(api_key=api_key)
    return _groq_client

# ----- Main LLM call -----
def call_llm(text: str) -> ResumeData:
    """Parse a resume using Groq LLM and return structured JSON."""
    client = get_groq_client()

    system_prompt = (
        "You are an expert resume parser. Extract structured JSON with keys:\n"
        "- contact {fullName, email, phone, location}\n"
        "- summary: string\n"
        "- skills: string[]\n"
        "- experience[{title, company, location, startDate, endDate, bullets[]}]\n"
        "- education[{degree, institution, field, startDate, endDate}]\n"
        "- certifications: string[]\n"
        "- languages: string[]\n"
        "Infer missing fields conservatively. Return ONLY valid JSON."
    )

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        temperature=0.2,
    )

    # Safely extract content
    content: str | None = None
    if resp.choices[0].message:
        content = resp.choices[0].message.content

    if not content:
        raise RuntimeError("No content returned from Groq LLM")

    # Cast the parsed JSON to the ResumeData type
    return cast(ResumeData, json.loads(content))
