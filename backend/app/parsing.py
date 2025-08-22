from io import BytesIO
from typing import Literal, Dict, List, Optional, Any
import mammoth
from pdfminer.high_level import extract_text
import re
import json
from datetime import datetime

def bytes_to_text(content: bytes, ext: Literal["pdf","docx","txt"]) -> str:
    """Extract text from various file formats."""
    if ext == "txt":
        return content.decode(errors="ignore")
    if ext == "docx":
        # Mammoth converts to HTML-ish text; we strip tags by removing '<...>'
        html = mammoth.convert_to_html(BytesIO(content)).value
        # quick strip
        txt = re.sub("<[^<]+?>", " ", html)
        return re.sub(r"\s+", " ", txt).strip()
    if ext == "pdf":
        # pdfminer can read from bytes via BytesIO
        return extract_text(BytesIO(content))
    raise ValueError("Unsupported file type")

def parse_resume_content(text: str) -> Dict[str, Any]:
    """Parse resume text and extract structured information."""
    parsed_data = {
        "contact": extract_contact_info(text),
        "skills": extract_skills(text),
        "experience": extract_experience(text),
        "education": extract_education(text),
        "summary": extract_summary(text),
        "certifications": extract_certifications(text),
        "languages": extract_languages(text)
    }
    
    return parsed_data

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract contact information from resume text."""
    contact_info = {
        "fullName": None,
        "email": None,
        "phone": None,
        "location": None,
        "linkedin": None,
        "github": None
    }
    
    # Email extraction
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    if email_match:
        contact_info["email"] = email_match.group()
    
    # Phone extraction (various formats)
    phone_patterns = [
        r'\+?\d{1,3}[\s\-\.]?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}',
        r'\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}',
        r'\d{3}[\s\-\.]\d{3}[\s\-\.]\d{4}'
    ]
    
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            contact_info["phone"] = phone_match.group().strip()
            break
    
    # LinkedIn profile
    linkedin_pattern = r'linkedin\.com/in/([a-zA-Z0-9\-]+)'
    linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
    if linkedin_match:
        contact_info["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"
    
    # GitHub profile
    github_pattern = r'github\.com/([a-zA-Z0-9\-]+)'
    github_match = re.search(github_pattern, text, re.IGNORECASE)
    if github_match:
        contact_info["github"] = f"https://github.com/{github_match.group(1)}"
    
    # Name extraction (first few lines, common patterns)
    lines = text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if line and not any(char.isdigit() or char in '@+().' for char in line):
            # Likely a name if it's 2-4 words, all letters
            words = line.split()
            if 2 <= len(words) <= 4 and all(word.isalpha() for word in words):
                contact_info["fullName"] = line
                break
    
    # Location extraction (look for city, state patterns)
    location_patterns = [
        r'([A-Za-z\s]+),\s*([A-Z]{2})\s*\d{5}',  # City, ST ZIP
        r'([A-Za-z\s]+),\s*([A-Z]{2})',  # City, ST
        r'([A-Za-z\s]+),\s*([A-Za-z\s]+)\s*\d{5}'  # City, State ZIP
    ]
    
    for pattern in location_patterns:
        location_match = re.search(pattern, text)
        if location_match:
            contact_info["location"] = location_match.group().strip()
            break
    
    return contact_info

def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text."""
    # Common technical skills database
    skill_database = [
        # Programming Languages
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
        'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash',
        
        # Web Technologies
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
        'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'jQuery',
        
        # Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
        'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase',
        
        # Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
        'GitHub Actions', 'Terraform', 'Ansible', 'Chef', 'Puppet',
        
        # Data Science & ML
        'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
        'Seaborn', 'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI',
        
        # Mobile Development
        'React Native', 'Flutter', 'iOS Development', 'Android Development',
        'Xamarin', 'Ionic', 'Cordova',
        
        # Other Technologies
        'Git', 'SVN', 'REST API', 'GraphQL', 'JSON', 'XML', 'YAML',
        'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS'
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    # Look for skills in the database
    for skill in skill_database:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    
    # Look for skills in common sections
    skills_sections = ['skills', 'technical skills', 'technologies', 'tools', 'expertise']
    
    for section in skills_sections:
        section_pattern = rf'{section}:?\s*([^\n{{2-5}}]+)'
        section_match = re.search(section_pattern, text_lower)
        if section_match:
            section_text = section_match.group(1)
            # Extract comma or bullet-separated items
            items = re.split(r'[,•·\-\n]', section_text)
            for item in items:
                skill = item.strip().title()
                if skill and len(skill.split()) <= 3 and skill not in found_skills:
                    found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extract work experience from resume text."""
    experience = []
    
    # Common experience section headers
    exp_patterns = [
        r'(?i)(experience|employment|work history|professional experience)([\s\S]*?)(?=education|skills|projects|$)',
        r'(?i)(work experience)([\s\S]*?)(?=education|skills|projects|$)'
    ]
    
    experience_text = ""
    for pattern in exp_patterns:
        match = re.search(pattern, text)
        if match:
            experience_text = match.group(2)
            break
    
    if not experience_text:
        return experience
    
    # Look for job entries with dates
    job_pattern = r'([A-Za-z\s,&]+)\s+([A-Za-z\s,&\.]+)\s+(\d{4}\s*[\-–]\s*(?:\d{4}|Present|Current))'
    jobs = re.findall(job_pattern, experience_text)
    
    for job in jobs:
        job_title = job[0].strip()
        company = job[1].strip()
        duration = job[2].strip()
        
        experience.append({
            "jobTitle": job_title,
            "company": company,
            "duration": duration,
            "description": ""  # Would need more sophisticated parsing for descriptions
        })
    
    return experience

def extract_education(text: str) -> List[Dict[str, Any]]:
    """Extract education information from resume text."""
    education = []
    
    # Common education section
    edu_pattern = r'(?i)(education|academic background)([\s\S]*?)(?=experience|skills|projects|certifications|$)'
    edu_match = re.search(edu_pattern, text)
    
    if edu_match:
        edu_text = edu_match.group(2)
        
        # Look for degree patterns
        degree_patterns = [
            r'(Bachelor|Master|PhD|Doctor|Associate|B\.?[AS]|M\.?[AS]|M\.?B\.?A|Ph\.?D)[^\n]*([A-Za-z\s]+)\s+([A-Za-z\s&,\.]+University|College|Institute)\s*(\d{4})?',
            r'([A-Za-z\s&,\.]+University|College|Institute)[^\n]*(Bachelor|Master|PhD|Doctor|Associate|B\.?[AS]|M\.?[AS]|M\.?B\.?A|Ph\.?D)[^\n]*(\d{4})?'
        ]
        
        for pattern in degree_patterns:
            degrees = re.findall(pattern, edu_text)
            for degree in degrees:
                if len(degree) >= 3:
                    education.append({
                        "degree": degree[0] if degree[0] else degree[1],
                        "fieldOfStudy": degree[1] if degree[0] else "",
                        "school": degree[2] if len(degree) > 2 else "",
                        "year": degree[3] if len(degree) > 3 else ""
                    })
    
    return education

def extract_summary(text: str) -> Optional[str]:
    """Extract professional summary or objective."""
    summary_patterns = [
        r'(?i)(summary|objective|profile|about)([\s\S]*?)(?=experience|education|skills|$)',
        r'(?i)(professional summary)([\s\S]*?)(?=experience|education|skills|$)'
    ]
    
    for pattern in summary_patterns:
        match = re.search(pattern, text)
        if match:
            summary = match.group(2).strip()
            # Clean up and limit length
            summary = re.sub(r'\s+', ' ', summary)
            if len(summary) > 500:
                summary = summary[:500] + "..."
            return summary
    
    return None

def extract_certifications(text: str) -> List[str]:
    """Extract certifications from resume text."""
    certifications = []
    
    cert_pattern = r'(?i)(certifications?|certificates?)([\s\S]*?)(?=experience|education|skills|projects|$)'
    cert_match = re.search(cert_pattern, text)
    
    if cert_match:
        cert_text = cert_match.group(2)
        # Split by common delimiters and clean up
        items = re.split(r'[\n•·\-]', cert_text)
        for item in items:
            cert = item.strip()
            if cert and len(cert) > 5 and len(cert) < 100:
                certifications.append(cert)
    
    return certifications

def extract_languages(text: str) -> List[str]:
    """Extract languages from resume text."""
    common_languages = [
        'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
        'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish',
        'Norwegian', 'Danish', 'Polish', 'Turkish', 'Greek', 'Hebrew'
    ]
    
    found_languages = []
    text_lower = text.lower()
    
    for language in common_languages:
        if re.search(r'\b' + language.lower() + r'\b', text_lower):
            found_languages.append(language)
    
    return found_languages

def calculate_match_score(resume_data: Dict[str, Any], job_description: str = "") -> int:
    """Calculate a match score between resume and job description."""
    if not job_description:
        # Base score without JD
        score = 50
        
        # Bonus for having contact info
        if resume_data.get('contact', {}).get('email'):
            score += 10
        if resume_data.get('contact', {}).get('phone'):
            score += 5
        
        # Bonus for skills
        skills_count = len(resume_data.get('skills', []))
        score += min(skills_count * 2, 20)
        
        # Bonus for experience
        exp_count = len(resume_data.get('experience', []))
        score += min(exp_count * 5, 15)
        
        return min(score, 100)
    
    # Match against job description
    jd_lower = job_description.lower()
    matched_skills = 0
    total_resume_skills = len(resume_data.get('skills', []))
    
    if total_resume_skills > 0:
        for skill in resume_data.get('skills', []):
            if skill.lower() in jd_lower:
                matched_skills += 1
        
        skill_match_ratio = matched_skills / total_resume_skills
        return min(int(skill_match_ratio * 100), 100)
    
    return 50  # Default score
